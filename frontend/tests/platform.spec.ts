import {test,expect} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
const output=path.resolve('../output/playwright');
fs.mkdirSync(output,{recursive:true});

test('simulated factory workflow through a recorded human approval',async({page})=>{
 await page.goto('/login');
 await page.getByLabel('Manager credential').fill('test-human-manager');
 await page.getByRole('button',{name:'Sign in to factory workspace'}).click();
 await expect(page).toHaveURL(/app\/approvals/);
 await page.goto('/app/fabricguard');
 await page.getByText('Register a fabric roll',{exact:true}).click();
 const registration=page.locator('details').first();
 await registration.getByLabel('Roll ID').fill('SIM-ROLL-1001');
 await registration.getByLabel('Supplier').fill('SIMULATED test supplier');
 await registration.getByLabel('Fabric type').fill('Cotton');
 await registration.getByLabel('Length (metres)').fill('500');
 await registration.getByLabel('Production order').selectOption('ORD-1001');
 await registration.getByLabel('Recorded by').fill('SIMULATED inspector');
 await registration.getByRole('button',{name:'Register fabric roll'}).click();
 await expect(page.getByLabel('Select fabric roll')).toHaveValue('SIM-ROLL-1001');
 await page.getByLabel('Uploader identity').fill('SIMULATED inspector');
 await page.getByLabel('Fabric photograph',{exact:true}).setInputFiles(path.resolve('tests/fixtures/simulated-fabric.png'));
 await page.getByRole('button',{name:'Preserve original image'}).click();
 const observe=page.locator('section.panel').filter({has:page.getByRole('heading',{name:'Record a defect observation',exact:true})});
 await expect(observe.getByLabel('Evidence image')).toContainText('Image #1');
 await observe.getByLabel('Evidence image').selectOption('1');
 await observe.getByLabel('Defect label').fill('SIMULATED oil stain');
 await observe.getByLabel('Evidence source').selectOption('HUMAN_REPORTED');
 await observe.getByLabel('Recorded by').fill('SIMULATED inspector');
 await observe.getByRole('button',{name:'Save pending observation'}).click();
 const verification=page.locator('section.panel').filter({has:page.getByRole('heading',{name:'Human verification',exact:true})});
 await expect(verification.getByLabel('Pending observation')).toContainText('SIMULATED oil stain');
 await verification.getByLabel('Pending observation').selectOption('1');
 await verification.getByLabel('Decision',{exact:false}).first().selectOption('VERIFIED');
 await verification.getByLabel('Inspector identity').fill('SIMULATED QA inspector');
 await verification.getByLabel('Decision notes').fill('SIMULATED visual confirmation');
 await verification.getByRole('button',{name:'Record inspector decision'}).click();
 await expect(page.locator('.observation-card .badge').first()).toHaveText('VERIFIED');
 await page.goto('/app/linewatch');
 await page.getByText('Register a production batch',{exact:true}).click();
 const batch=page.locator('details').first();
 await batch.getByLabel('Batch ID').fill('SIM-BATCH-1001');
 await batch.getByLabel('Order',{exact:false}).first().selectOption('ORD-1001');
 await batch.getByLabel('Cutting line').fill('SIM-CUT-1');
 await batch.getByLabel('Sewing line').fill('SIM-SEW-1');
 await batch.getByLabel('Planned quantity').fill('2000');
 await batch.getByLabel('Recorded by').fill('SIMULATED production manager');
 await batch.getByRole('button',{name:'Register production batch'}).click();
 const allocate=page.locator('section.panel').filter({has:page.getByRole('heading',{name:'Allocate a fabric roll',exact:true})});
 await expect(allocate.getByLabel('Production batch')).toHaveValue('SIM-BATCH-1001');
 await allocate.getByLabel('Fabric roll').selectOption('SIM-ROLL-1001');
 await allocate.getByLabel('Allocated length (m)').fill('200');
 await allocate.getByLabel('Recorded by').fill('SIMULATED production manager');
 await allocate.getByRole('button',{name:'Link roll to batch'}).click();
 await expect(page.locator('.trace-flow')).toContainText('SIM-ROLL-1001');
 await page.getByRole('button',{name:'Save evidence investigation'}).click();
 await page.goto('/app/orderrescue');
 const estimates=[['Rework cost / unit (BDT)','20'],['Rework units / hour','100'],['Replacement cost / unit (BDT)','180'],['Replacement units / hour','120'],['Replacement material / units','2000'],['Available approved stock / units','1000'],['Stock allocation cost / unit (BDT)','150'],['Stock handling hours','3']];
 for(const [label,value] of estimates)await page.getByLabel(label).fill(value);
 await page.getByLabel('Material compatibility confirmed').check();
 await page.getByLabel('Buyer specification compatibility confirmed').check();
 await page.getByLabel('Quality reinspection authorized').check();
 await page.getByLabel('Actual capacity availability confirmed').check();
 await page.getByLabel('Source of estimates and assumptions').fill('SIMULATED ORD-1001 scenario for automated validation.');
 await page.getByRole('button',{name:'Calculate recovery alternatives'}).click();
 await expect(page.locator('.scenario-card')).toHaveCount(4);
 await expect(page.locator('.scenario-card').first()).toContainText('40,000');
 const save=page.locator('section.panel').filter({has:page.getByRole('heading',{name:'Save a recovery proposal',exact:true})});
 await save.getByLabel('Selected alternative').selectOption('REWORK');
 await save.getByLabel('Proposed by').fill('SIMULATED planner');
 await save.getByLabel('Evidence and rationale').fill('SIMULATED verified fabric evidence and production trace.');
 await save.getByRole('button',{name:'Save proposed recovery plan'}).click();
 await page.goto('/app/approvals');
 await page.getByLabel('Proposed plan').selectOption('1');
 await page.getByLabel('Requested by').fill('SIMULATED planner');
 await page.getByRole('button',{name:'Send to approval queue'}).click();
 await page.getByLabel('Decision',{exact:false}).first().selectOption('APPROVED');
 await page.getByLabel('Manager identity').fill('SIMULATED human manager');
 await page.getByLabel('Decision notes').fill('SIMULATED approval only; no factory execution.');
 await page.getByLabel('I am the human manager reviewing this proposal.').check();
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'Record manager decision'}).click();
 await expect(page.getByText('Decision by SIMULATED human manager:',{exact:false})).toBeVisible();
 await page.goto('/app');
 await expect(page.locator('.metric-card').first().locator('.metric-value')).toHaveText('1');
 await page.screenshot({path:path.join(output,'command-center-desktop.png'),fullPage:true});
});

for(const width of [1440,1280,768,390]){
 test(`responsive public and operational routes at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  const routes=['/','/products','/products/fabricguard','/products/linewatch','/products/orderrescue','/technology','/about','/contact','/privacy','/terms','/login','/app','/app/fabricguard','/app/visual-inspection','/app/linewatch','/app/orderrescue','/app/reports','/app/approvals','/app/audit','/app/settings'];
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of routes){
   const response=await page.goto(route);
   expect(response?.status(),route).toBe(200);
   await expect(page.locator('h1,h2').first()).toBeVisible();
   await page.waitForLoadState('networkidle');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`overflow at ${route}`).toBeTruthy();
  }
  expect(errors).toEqual([]);
  if(width===1440||width===390){
   await page.goto('/');await page.waitForLoadState('networkidle');await page.screenshot({path:path.join(output,`public-${width}.png`),fullPage:true});
   await page.goto('/app');await expect(page.locator('.metric-card')).toHaveCount(7);await page.screenshot({path:path.join(output,`workspace-${width}.png`),fullPage:true});
  }
  if(width===390){
   await page.goto('/');await page.getByRole('button',{name:'Toggle navigation'}).click();
   await expect(page.getByRole('link',{name:'Products',exact:true}).first()).toBeVisible();
  }
 });
}
