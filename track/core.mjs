export function validate(input){
 const registration=typeof input?.registration==='string'?input.registration.trim().toUpperCase().replace(/ +/g,''):'';
 const email=typeof input?.email==='string'?input.email.trim():'';
 const budget=input?.budgetPence;
 if(!/^[A-Z0-9]{2,8}$/.test(registration)||!/[A-Z]/.test(registration)||!/[0-9]/.test(registration))throw Error('Enter a specific registration containing letters and numbers.');
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');
 if(!Number.isSafeInteger(budget)||budget<100||budget>1000000000)throw Error('Enter a budget between £1 and £10 million.');
 if(input?.consent!==true)throw Error('Confirm that you want matching alerts.');
 return {registration,email,budgetPence:budget};
}
export function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('')}
export async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('')}
export function matches(r,l,now){return r.status==='verified'&&r.expires_at>now&&l.approved===1&&Boolean(l.permission_ref)&&l.expires_at>now&&r.registration===l.registration&&l.total_pence<=r.budget_pence}
