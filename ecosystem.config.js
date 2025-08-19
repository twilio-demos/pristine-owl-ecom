module.exports = {
  apps: [
    {
      name: 'lawson-reinhardt-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      ignore_watch: ['node_modules', '.git', '.next'],
      max_memory_restart: '1G'
    }
  ]
};