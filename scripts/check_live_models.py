"""Bounded opt-in live connector check. Never prints keys or provider error bodies."""
import asyncio
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from agents import Agent,Runner,ModelSettings
from ai.meta_adapter import get_meta_model
from ai.sam_service import segment_fabric
from core.config import PROJECT_ROOT

async def check():
    results={}
    try:
        agent=Agent(name='StitchRescue connectivity check',model=get_meta_model(),
                    instructions='Return READY only.',model_settings=ModelSettings(max_tokens=16))
        result=await asyncio.wait_for(Runner.run(agent,input='Connectivity check. Return READY.',max_turns=1),timeout=35)
        results['reasoning']={'status':'completed','nonempty_output':bool(str(result.final_output).strip())}
    except Exception as exc:
        results['reasoning']={'status':'unavailable','error_type':type(exc).__name__,'http_status':getattr(exc,'status_code',None)}
    try:
        image=PROJECT_ROOT/'frontend/tests/fixtures/simulated-fabric.png'
        result=await asyncio.wait_for(segment_fabric(str(image),'fabric'),timeout=45)
        results['segmentation']={'status':result['outcome'],'boxes':len(result['boxes']),'masks':len(result['masks'])}
    except Exception as exc:
        results['segmentation']={'status':'unavailable','error_type':type(exc).__name__,'http_status':getattr(exc,'status_code',None)}
    print(json.dumps(results))

if __name__=='__main__': asyncio.run(check())
