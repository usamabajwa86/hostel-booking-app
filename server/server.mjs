import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Serve public static files (images, etc.)
const publicDir = path.join(__dirname, '..', 'public');
app.use('/hostel-pictures', express.static(path.join(publicDir, 'hostel-pictures'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400')
}));
app.use('/vc-zulfiqar-ali.jpg', express.static(path.join(publicDir, 'vc-zulfiqar-ali.jpg')));
app.use('/humera-razaq.jpg', express.static(path.join(publicDir, 'humera-razaq.jpg')));
app.use('/uaf-hero.jpg', express.static(path.join(publicDir, 'uaf-hero.jpg')));

// Serve Vite built frontend in production
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const HOSTELS_FILE = path.join(__dirname, '..', 'src', 'data', 'hostels.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================================
// In-memory OTP store (for mock email verification)
// Production would use Redis + actual SMTP delivery (SendGrid/SES)
// ============================================================
const otpStore = new Map(); // email -> { code, expiresAt }

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isProfileComplete(user) {
  if (!user) return false;
  return Boolean(
    user.profile &&
    user.profile.degreeName &&
    user.profile.semester &&
    user.profile.cnic &&
    user.profile.phone &&
    user.profile.fatherName &&
    user.profile.address
  );
}

function mergeBedStatuses(hostels, requests) {
  const bedStatusMap = {};
  const bedOccupantMap = {};
  for (const req of requests) {
    if (req.status === 'approved') {
      bedStatusMap[req.bedId] = 'booked';
      bedOccupantMap[req.bedId] = { userName: req.userName, studentId: req.studentId, requestId: req.id };
    } else if (req.status === 'pending') {
      bedStatusMap[req.bedId] = 'pending';
      bedOccupantMap[req.bedId] = { userName: req.userName, studentId: req.studentId, requestId: req.id };
    }
  }

  return hostels.map(hostel => ({
    ...hostel,
    rooms: hostel.rooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => ({
        ...bed,
        status: bedStatusMap[bed.id] || 'vacant',
        occupant: bedOccupantMap[bed.id] || null
      }))
    }))
  }));
}

function safeUser(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

// =====================
// AUTH — MOCK EMAIL OTP (for university dev/demo)
// =====================

// POST /api/auth/send-otp — generate a 6-digit code and "send" it
// In demo mode the code is returned directly so the UI can show it on screen.
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const code = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email.toLowerCase(), { code, expiresAt });

    // Demo mode: return the code directly so the UI can show it on screen
    res.json({
      message: 'OTP generated. In production this would be emailed to you.',
      demoCode: code,
      expiresInMinutes: 10,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-otp — confirm the code matches and is not expired
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const entry = otpStore.get(email.toLowerCase());
    if (!entry) return res.status(404).json({ error: 'No verification code requested for this email' });
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(410).json({ error: 'Verification code expired. Request a new one.' });
    }
    if (entry.code !== code) return res.status(401).json({ error: 'Incorrect verification code' });

    // Code is valid — keep it usable for the registration call
    res.json({ message: 'Verification successful', verified: true });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register — only succeeds if OTP was verified
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, gender, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'Name, email, password and verification code are required' });
    }

    // Verify OTP one more time before creating the account
    const otpEntry = otpStore.get(email.toLowerCase());
    if (!otpEntry || otpEntry.code !== otp) {
      return res.status(401).json({ error: 'Invalid or missing verification code' });
    }
    if (Date.now() > otpEntry.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(410).json({ error: 'Verification code expired. Please restart registration.' });
    }

    const users = readJSON(USERS_FILE);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = {
      id: `s${Date.now()}`,
      name,
      email,
      password,
      gender: gender || 'female',
      role: 'student',
      emailVerified: true,
      profile: null, // student must complete profile before booking
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);
    otpStore.delete(email.toLowerCase()); // burn the OTP

    res.status(201).json(safeUser(newUser));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login — also returns superintendent's hostel info
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(safeUser(user));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// USER PROFILE
// =====================

// PATCH /api/users/:id/profile — student updates their profile
app.patch('/api/users/:id/profile', (req, res) => {
  try {
    const users = readJSON(USERS_FILE);
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    const profileFields = [
      'fatherName', 'cnic', 'phone', 'address', 'degreeName',
      'semester', 'department', 'enrollmentYear', 'program',
      'semesterStatus', // 'first' | 'senior'
      'registrationNumber', // required for senior students
    ];

    const profile = users[idx].profile || {};
    for (const key of profileFields) {
      if (req.body[key] !== undefined) profile[key] = req.body[key];
    }

    users[idx].profile = profile;
    // Also mirror commonly read fields at the top level for convenience
    if (profile.program) users[idx].program = profile.program;
    if (profile.registrationNumber) users[idx].studentId = profile.registrationNumber;

    writeJSON(USERS_FILE, users);
    res.json(safeUser(users[idx]));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id — fetch latest user (used after profile update)
app.get('/api/users/:id', (req, res) => {
  try {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(safeUser(user));
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// HOSTELS
// =====================

app.get('/api/hostels', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);
    res.json(mergeBedStatuses(hostels, requests));
  } catch (err) {
    console.error('Get hostels error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/hostels/:id', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);
    const merged = mergeBedStatuses(hostels, requests);
    const hostel = merged.find(h => h.id === req.params.id);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });
    res.json(hostel);
  } catch (err) {
    console.error('Get hostel error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// REQUESTS (with audit history)
// =====================

app.post('/api/requests', (req, res) => {
  try {
    const {
      userId, userName, userEmail, studentId, hostelId, hostelName,
      roomNumber, bedId, idCardImage, challan, semesterStatus, registrationNumber,
    } = req.body;

    if (!userId || !userName || !userEmail || !hostelId || !hostelName || !roomNumber || !bedId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Enforce profile completion
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!isProfileComplete(user)) {
      return res.status(403).json({
        error: 'Please complete your student profile before booking',
        code: 'PROFILE_INCOMPLETE',
      });
    }

    // Enforce challan vs registration ID logic
    if (semesterStatus === 'first') {
      if (!challan || !challan.challanNumber || !challan.bankName || !challan.paidAmount) {
        return res.status(400).json({ error: 'First-semester students must provide complete challan details' });
      }
    } else if (semesterStatus === 'senior') {
      if (!registrationNumber) {
        return res.status(400).json({ error: 'Senior students must provide their registration number' });
      }
    }

    const requests = readJSON(REQUESTS_FILE);

    if (requests.find(r => r.userId === userId && r.status === 'pending')) {
      return res.status(409).json({ error: 'You already have a pending booking request' });
    }

    if (requests.find(r => r.bedId === bedId && (r.status === 'approved' || r.status === 'pending'))) {
      return res.status(409).json({ error: 'This bed is already taken' });
    }

    const requestId = `req-${Date.now()}`;
    let idCardPath = '';

    if (idCardImage) {
      const base64Data = idCardImage.replace(/^data:image\/\w+;base64,/, '');
      const extMatch = idCardImage.match(/^data:image\/(\w+);base64,/);
      const ext = extMatch ? extMatch[1] : 'jpg';
      const fileName = `id-${requestId}.${ext === 'jpeg' ? 'jpg' : ext}`;
      fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(base64Data, 'base64'));
      idCardPath = `uploads/${fileName}`;
    }

    const now = new Date().toISOString();
    const newRequest = {
      id: requestId,
      userId, userName, userEmail,
      studentId: studentId || registrationNumber || '',
      hostelId, hostelName, roomNumber, bedId,
      idCardImage: idCardPath,
      challan: challan || null,
      semesterStatus: semesterStatus || (user.profile?.semesterStatus) || null,
      registrationNumber: registrationNumber || null,
      status: 'pending',
      submittedAt: now,
      history: [
        { status: 'pending', timestamp: now, note: 'Booking request submitted' }
      ]
    };

    requests.push(newRequest);
    writeJSON(REQUESTS_FILE, requests);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/requests', (req, res) => {
  try {
    const requests = readJSON(REQUESTS_FILE);
    const { userId, hostelId } = req.query;
    let result = requests;
    if (userId) result = result.filter(r => r.userId === userId);
    if (hostelId) result = result.filter(r => r.hostelId === hostelId);
    res.json(result);
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/requests/:id/status', (req, res) => {
  try {
    const { status, actorRole, actorName } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    const requests = readJSON(REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Request not found' });

    const now = new Date().toISOString();
    requests[index].status = status;
    requests[index][status === 'approved' ? 'approvedAt' : 'rejectedAt'] = now;

    if (!requests[index].history) requests[index].history = [];
    const actor = actorRole === 'superintendent' ? `${actorName || 'Superintendent'}` : 'Admin';
    requests[index].history.push({
      status,
      timestamp: now,
      note: `Booking ${status} by ${actor}`,
    });

    writeJSON(REQUESTS_FILE, requests);
    res.json(requests[index]);
  } catch (err) {
    console.error('Update request status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/requests/:id', (req, res) => {
  try {
    const requests = readJSON(REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Request not found' });

    const now = new Date().toISOString();
    requests[index].status = 'vacated';
    requests[index].vacatedAt = now;
    if (!requests[index].history) requests[index].history = [];
    requests[index].history.push({
      status: 'vacated',
      timestamp: now,
      note: 'Booking vacated by student'
    });

    writeJSON(REQUESTS_FILE, requests);
    res.json({ message: 'Booking vacated', request: requests[index] });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// SUPERINTENDENT — per-hostel scoped endpoints
// =====================

// GET /api/superintendent/:hostelId/stats
app.get('/api/superintendent/:hostelId/stats', (req, res) => {
  try {
    const { hostelId } = req.params;
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const hostel = hostels.find(h => h.id === hostelId);
    if (!hostel) return res.status(404).json({ error: 'Hostel not found' });

    const requests = readJSON(REQUESTS_FILE).filter(r => r.hostelId === hostelId);
    const totalBeds = (hostel.rooms || []).reduce((s, r) => s + (r.beds?.length || 0), 0);
    const totalRooms = (hostel.rooms || []).length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const ugRooms = (hostel.rooms || []).filter(r => (r.programCategory || '').toLowerCase() === 'undergraduate').length;
    const pgRooms = (hostel.rooms || []).filter(r => (r.programCategory || '').toLowerCase() === 'postgraduate').length;

    res.json({
      hostelId,
      hostelName: hostel.name,
      totalBeds,
      totalRooms,
      approvedBookings: approved,
      pendingRequests: pending,
      vacantBeds: totalBeds - approved - pending,
      ugRooms,
      pgRooms,
      occupancyPercent: totalBeds > 0 ? Math.round((approved / totalBeds) * 100) : 0,
    });
  } catch (err) {
    console.error('Superintendent stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/superintendent/:hostelId/requests
app.get('/api/superintendent/:hostelId/requests', (req, res) => {
  try {
    const { hostelId } = req.params;
    const requests = readJSON(REQUESTS_FILE).filter(r => r.hostelId === hostelId);
    res.json(requests);
  } catch (err) {
    console.error('Superintendent requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/superintendent/:hostelId/students — students with bookings in this hostel
app.get('/api/superintendent/:hostelId/students', (req, res) => {
  try {
    const { hostelId } = req.params;
    const requests = readJSON(REQUESTS_FILE).filter(r => r.hostelId === hostelId && r.status !== 'rejected');
    const users = readJSON(USERS_FILE);

    const studentRows = requests.map(r => {
      const u = users.find(x => x.id === r.userId);
      return {
        requestId: r.id,
        userId: r.userId,
        name: r.userName,
        email: r.userEmail,
        studentId: r.studentId,
        registrationNumber: u?.profile?.registrationNumber || r.registrationNumber || null,
        phone: u?.profile?.phone || null,
        cnic: u?.profile?.cnic || null,
        program: u?.profile?.program || u?.program || null,
        semester: u?.profile?.semester || null,
        degreeName: u?.profile?.degreeName || null,
        roomNumber: r.roomNumber,
        bedId: r.bedId,
        status: r.status,
        submittedAt: r.submittedAt,
      };
    });

    res.json(studentRows);
  } catch (err) {
    console.error('Superintendent students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// ADMIN
// =====================

app.get('/api/admin/stats', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);
    const users = readJSON(USERS_FILE);

    let totalBeds = 0;
    for (const hostel of hostels) {
      for (const room of hostel.rooms) {
        totalBeds += room.beds.length;
      }
    }

    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const pendingCount = requests.filter(r => r.status === 'pending').length;

    res.json({
      totalBeds,
      vacantBeds: totalBeds - approvedCount - pendingCount,
      pendingRequests: pendingCount,
      approvedBookings: approvedCount,
      registeredStudents: users.filter(u => u.role === 'student').length,
      totalRequests: requests.length,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = readJSON(USERS_FILE);
    res.json(users.map(safeUser));
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export/students — CSV of all students with booking info
app.get('/api/admin/export/students', (req, res) => {
  try {
    const users = readJSON(USERS_FILE).filter(u => u.role === 'student');
    const requests = readJSON(REQUESTS_FILE);

    const headers = ['Name', 'Reg / Student ID', 'Email', 'Phone', 'CNIC', 'Program', 'Semester', 'Registered', 'Booking Status', 'Hostel', 'Room', 'Bed'];
    const rows = users.map(u => {
      const booking = requests.find(r => r.userId === u.id && r.status === 'approved');
      const pending = requests.find(r => r.userId === u.id && r.status === 'pending');
      const active = booking || pending;
      return [
        u.name,
        u.profile?.registrationNumber || u.studentId || '',
        u.email,
        u.profile?.phone || '',
        u.profile?.cnic || '',
        u.profile?.program || u.program || '',
        u.profile?.semester || '',
        u.registeredAt || '',
        booking ? 'Approved' : pending ? 'Pending' : 'No Booking',
        active ? active.hostelName : '',
        active ? active.roomNumber : '',
        active ? active.bedId : ''
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export/beds — CSV of all beds with occupant info
app.get('/api/admin/export/beds', (req, res) => {
  try {
    const hostelsRaw = readJSON(HOSTELS_FILE);
    const hostels = hostelsRaw.hostels || hostelsRaw;
    const requests = readJSON(REQUESTS_FILE);

    const bedMap = {};
    for (const r of requests) {
      if (r.status === 'approved') bedMap[r.bedId] = r;
    }

    const headers = ['Hostel', 'Room', 'Bed ID', 'Status', 'Student Name', 'Student ID', 'Email', 'Booked Since'];
    const rows = [];
    for (const h of hostels) {
      for (const room of h.rooms) {
        for (const bed of room.beds) {
          const occ = bedMap[bed.id];
          rows.push([
            h.name, room.number, bed.id,
            occ ? 'Occupied' : 'Vacant',
            occ ? occ.userName : '',
            occ ? occ.studentId : '',
            occ ? occ.userEmail : '',
            occ ? occ.approvedAt || occ.submittedAt : ''
          ]);
        }
      }
    }

    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bed_assignments.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export beds error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export/history — CSV of complete booking history
app.get('/api/admin/export/history', (req, res) => {
  try {
    const requests = readJSON(REQUESTS_FILE);
    const headers = ['Request ID', 'Student Name', 'Student ID', 'Email', 'Hostel', 'Room', 'Bed', 'Status', 'Submitted', 'Approved', 'Rejected', 'Vacated'];
    const rows = requests.map(r => [
      r.id, r.userName, r.studentId, r.userEmail,
      r.hostelName, r.roomNumber, r.bedId, r.status,
      r.submittedAt || '', r.approvedAt || '', r.rejectedAt || '', r.vacatedAt || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=booking_history.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// SETTINGS
// =====================

app.get('/api/settings', (req, res) => {
  try {
    const settings = readJSON(SETTINGS_FILE);
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const settings = readJSON(SETTINGS_FILE);
    const updated = { ...settings, ...req.body };
    writeJSON(SETTINGS_FILE, updated);
    res.json(updated);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// SPA catch-all — serve index.html for all non-API routes in production
if (fs.existsSync(distDir)) {
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
