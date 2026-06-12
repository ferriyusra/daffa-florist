// PM2 config — deploy Next.js (next start) di server/VPS.
// Pakai: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'daffa-florist',
      // Jalankan binari Next langsung (lebih bersih daripada lewat npm).
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      // fork = 1 proses. Untuk multi-core, ganti ke 'cluster' + instances: 'max'.
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL diisi lewat .env
        // (otomatis dibaca Next) atau di-export sebelum start.
      },
    },
  ],

  // ── Opsional: deploy otomatis berbasis git (pm2 deploy) ──
  // Isi host/repo, lalu:
  //   pm2 deploy production setup     (sekali, clone repo di server)
  //   pm2 deploy production           (deploy: pull → install → migrate → build → reload)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-user/daffa-florist.git',
      path: '/var/www/daffa-florist',
      // Migration + build + reload jalan otomatis tiap deploy.
      'post-deploy':
        'npm ci && npm run migrate:deploy && npm run build && pm2 reload ecosystem.config.js --update-env && pm2 save',
    },
  },
};
