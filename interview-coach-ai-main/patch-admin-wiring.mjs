#!/usr/bin/env node
// Wires the new Admin Module into the existing app.
// Patches 6 existing files. Safe to re-run (skips anchors already applied).
// Save this file in interview-coach-ai-main/ (the project root, next to
// package.json) and run from there: node patch-admin-wiring.mjs
import fs from 'fs';

function patch(filePath, oldStr, newStr, label, skipIfPresent) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ! SKIP  (file not found) ${label} — ${filePath}`);
    return;
  }
  const src = fs.readFileSync(filePath, 'utf8');
  if (skipIfPresent && src.includes(skipIfPresent)) {
    console.log(`  = SKIP  (already applied) ${label}`);
    return;
  }
  const count = src.split(oldStr).length - 1;
  if (count === 0) {
    console.log(`  ! ABORT (anchor not found) ${label} — ${filePath}`);
    return;
  }
  if (count > 1) {
    console.log(`  ! ABORT (anchor matches ${count}x, ambiguous) ${label} — ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, src.replace(oldStr, newStr), 'utf8');
  console.log(`  + APPLIED  ${label}`);
}

console.log('Patching backend/server.js ...');
patch(
  'backend/server.js',
  `import performanceRoutes  from './routes/performanceRoutes.js';\nimport learningPathRoutes from './routes/learningPathRoutes.js';`,
  `import performanceRoutes  from './routes/performanceRoutes.js';\nimport learningPathRoutes from './routes/learningPathRoutes.js';\nimport adminAuthRoutes    from './routes/adminAuthRoutes.js';\nimport adminRoutes        from './routes/adminRoutes.js';`,
  'server.js — import admin routes',
  `import adminAuthRoutes    from './routes/adminAuthRoutes.js';`
);
patch(
  'backend/server.js',
  `app.use('/api/learning-paths', learningPathRoutes);`,
  `app.use('/api/learning-paths', learningPathRoutes);\napp.use('/api/admin-auth',     adminAuthRoutes);\napp.use('/api/admin',          adminRoutes);`,
  'server.js — register admin routes',
  `app.use('/api/admin-auth',`
);

console.log('Patching src/main.jsx ...');
patch(
  'src/main.jsx',
  `import { AuthProvider } from './context/AuthContext.jsx'`,
  `import { AuthProvider } from './context/AuthContext.jsx'\nimport { AdminAuthProvider } from './context/AdminAuthContext.jsx'`,
  'main.jsx — import AdminAuthProvider',
  `import { AdminAuthProvider } from './context/AdminAuthContext.jsx'`
);
patch(
  'src/main.jsx',
  `      <AuthProvider>\n        <App />`,
  `      <AuthProvider>\n      <AdminAuthProvider>\n        <App />`,
  'main.jsx — open AdminAuthProvider wrapper',
  `<AdminAuthProvider>\n        <App />`
);
patch(
  'src/main.jsx',
  `        />\n      </AuthProvider>`,
  `        />\n      </AdminAuthProvider>\n      </AuthProvider>`,
  'main.jsx — close AdminAuthProvider wrapper',
  `</AdminAuthProvider>\n      </AuthProvider>`
);

console.log('Patching src/App.jsx ...');
patch(
  'src/App.jsx',
  `import ProfilePage from './pages/ProfilePage';`,
  `import ProfilePage from './pages/ProfilePage';\nimport AdminLoginPage from './pages/admin/AdminLoginPage';\nimport ProtectedAdminRoute from './components/ProtectedAdminRoute';\nimport AdminLayout from './layouts/AdminLayout';\nimport AdminDashboardPage from './pages/admin/AdminDashboardPage';\nimport AdminStudentsPage from './pages/admin/AdminStudentsPage';\nimport AdminQuestionsPage from './pages/admin/AdminQuestionsPage';\nimport AdminStaffPage from './pages/admin/AdminStaffPage';\nimport AdminEvaluationsPage from './pages/admin/AdminEvaluationsPage';\nimport AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';\nimport AdminSkillGapsPage from './pages/admin/AdminSkillGapsPage';\nimport AdminSettingsPage from './pages/admin/AdminSettingsPage';\nimport AdminAlertsPage from './pages/admin/AdminAlertsPage';\nimport AdminAuditLogPage from './pages/admin/AdminAuditLogPage';`,
  'App.jsx — import admin components',
  `import AdminLoginPage from './pages/admin/AdminLoginPage';`
);
patch(
  'src/App.jsx',
  `      <Route path="/register" element={<RegisterPage />} />`,
  `      <Route path="/register" element={<RegisterPage />} />\n      <Route path="/staff-login" element={<AdminLoginPage />} />`,
  'App.jsx — add /staff-login route',
  `<Route path="/staff-login" element={<AdminLoginPage />} />`
);
patch(
  'src/App.jsx',
  `        <Route path="/profile" element={<ProfilePage />} />\n      </Route>\n    </Routes>`,
  `        <Route path="/profile" element={<ProfilePage />} />\n      </Route>\n\n      {/* admin / staff portal */}\n      <Route\n        element={\n          <ProtectedAdminRoute>\n            <AdminLayout />\n          </ProtectedAdminRoute>\n        }\n      >\n        <Route path="/admin" element={<AdminDashboardPage />} />\n        <Route path="/admin/students" element={<AdminStudentsPage />} />\n        <Route path="/admin/staff" element={<AdminStaffPage />} />\n        <Route path="/admin/questions" element={<AdminQuestionsPage />} />\n        <Route path="/admin/evaluations" element={<AdminEvaluationsPage />} />\n        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />\n        <Route path="/admin/skill-gaps" element={<AdminSkillGapsPage />} />\n        <Route path="/admin/settings" element={<AdminSettingsPage />} />\n        <Route path="/admin/alerts" element={<AdminAlertsPage />} />\n        <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />\n      </Route>\n    </Routes>`,
  'App.jsx — add protected /admin/* routes',
  `{/* admin / staff portal */}`
);

console.log('Patching src/pages/LoginPage.jsx ...');
patch(
  'src/pages/LoginPage.jsx',
  `          <p className="text-center text-sm text-slate-400 mt-6">\n            Don't have an account?{' '}\n            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">\n              Sign up\n            </Link>\n          </p>`,
  `          <p className="text-center text-sm text-slate-400 mt-6">\n            Don't have an account?{' '}\n            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">\n              Sign up\n            </Link>\n          </p>\n\n          <p className="text-center text-xs text-slate-500 mt-3">\n            <Link to="/staff-login" className="hover:text-slate-300 underline">\n              Staff / Admin Portal\n            </Link>\n          </p>`,
  'LoginPage.jsx — add Staff Portal link',
  `Staff / Admin Portal`
);

console.log('Patching backend/services/auth.service.js ...');
patch(
  'backend/services/auth.service.js',
  `  // 1. Find user (includes password_hash)\n  const user = await userRepository.findByEmail(email);\n  if (!user) {\n    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });\n  }\n\n  // 2. Verify password — ALWAYS, no bypasses`,
  `  // 1. Find user (includes password_hash)\n  const user = await userRepository.findByEmail(email);\n  if (!user) {\n    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });\n  }\n\n  // 1b. Blocked by admin — deactivated accounts can't log in\n  if (user.is_active === false) {\n    throw Object.assign(new Error('This account has been deactivated. Contact your administrator.'), { statusCode: 403 });\n  }\n\n  // 2. Verify password — ALWAYS, no bypasses`,
  'auth.service.js — block login for deactivated students',
  `1b. Blocked by admin`
);

console.log('Patching backend/middleware/auth.middleware.js ...');
patch(
  'backend/middleware/auth.middleware.js',
  `    const user = await userRepository.findById(decoded.id);\n    if (!user) {\n      return res.status(401).json({\n        success:   false,\n        message:   'User no longer exists',\n        errorCode: 'USER_NOT_FOUND',\n      });\n    }\n    req.user = user;\n    return next();`,
  `    const user = await userRepository.findById(decoded.id);\n    if (!user) {\n      return res.status(401).json({\n        success:   false,\n        message:   'User no longer exists',\n        errorCode: 'USER_NOT_FOUND',\n      });\n    }\n    if (user.is_active === false) {\n      return res.status(403).json({\n        success:   false,\n        message:   'This account has been deactivated. Contact your administrator.',\n        errorCode: 'ACCOUNT_DEACTIVATED',\n      });\n    }\n    req.user = user;\n    return next();`,
  'auth.middleware.js — block already-issued tokens for deactivated students',
  `errorCode: 'ACCOUNT_DEACTIVATED'`
);

console.log('\nDone.');
