import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:120000,workers:1,fullyParallel:false,
 use:{baseURL:'http://127.0.0.1:3001',headless:true,viewport:{width:1440,height:1000},trace:'retain-on-failure'},
 webServer:[
  {command:'../.venv/bin/python -m backend.tests.run_test_server',cwd:'..',url:'http://127.0.0.1:8001/health',reuseExistingServer:false,timeout:30000},
  {command:'npm run dev -- --port 3001',url:'http://127.0.0.1:3001',env:{BACKEND_URL:'http://127.0.0.1:8001',NEXT_TELEMETRY_DISABLED:'1'},reuseExistingServer:false,timeout:120000}
 ]});
