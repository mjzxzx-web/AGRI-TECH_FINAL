const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check for duplicate email
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Determine approval:
    // - Farmers always start unapproved (need admin approval)
    // - The very first admin ever is auto-approved (bootstrapping)
    // - Any subsequent admin requires approval from an existing approved admin
    const assignedRole = role || 'farmer';
    let approved = false;

    if (assignedRole === 'admin') {
      // Count only approved admins — this prevents a stuck unapproved admin
      // from blocking the "first admin" bootstrap forever
      const approvedAdminCount = await User.countDocuments({ role: 'admin', approved: true });
      approved = approvedAdminCount === 0;
    }

    const user = new User({ name, email, password: hashed, role: assignedRole, approved });
    await user.save();

    // Not approved — return info message, no token
    if (!approved) {
      return res.status(201).json({
        msg: assignedRole === 'admin'
          ? 'Admin account created. An existing admin must approve your account before you can log in.'
          : 'Account created. An admin must approve your account before you can log in.',
        approved: false
      });
    }

    // Approved (first admin) — return token immediately, no need for a second login call
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error', detail: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check banned before approved — gives a clearer message
    if (user.banned) {
      return res.status(403).json({
        msg: 'Your account has been suspended.',
        banned: true
      });
    }

    if (!user.approved) {
      return res.status(401).json({
        msg: 'Account not approved by admin. Please wait for an admin to approve your account.'
      });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};