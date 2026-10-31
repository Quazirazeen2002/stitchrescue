export async function api<T>(path:string, options:RequestInit={}):Promise<T> {
  const headers=new Headers(options.headers);
  if(options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
  if(typeof window!=='undefined') { const token=sessionStorage.getItem('stitchrescue-manager'); if(token) headers.set('X-Manager-Token',token); }
  const response=await fetch(`/api/v1${path}`,{...options,headers});
  if(!response.ok){
    const error=await response.json().catch(()=>({detail:'The server could not process this request.'}));
    const detail=Array.isArray(error.detail)?error.detail.map((e:{msg:string;loc:string[]})=>`${e.loc.slice(1).join('.')}: ${e.msg}`).join('; '):error.detail;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}
export function post<T>(path:string,data:unknown,method='POST'){return api<T>(path,{method,body:data instanceof FormData?data:JSON.stringify(data)});}
export const money=(n:number)=>new Intl.NumberFormat('en-BD',{style:'currency',currency:'BDT',maximumFractionDigits:0}).format(n);
export const number=(n:number)=>new Intl.NumberFormat('en-BD').format(n);
