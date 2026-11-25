// Pure functions only. No network, customer data or live inventory.
export function normalize(value) {
 if(typeof value!=='string'||!/^[A-Za-z0-9 ]{1,12}$/.test(value)) return null;
 const s=value.toUpperCase().replaceAll(' ','');
 return s.length>=2&&s.length<=8?s:null;
}
export function matchExact(request,listing,now=Date.now()){
 const a=normalize(request.registration),b=normalize(listing.registration);
 return Boolean(a&&a===b&&request.status==='verified'&&listing.status==='approved'&&listing.authorised===true&&Number.isSafeInteger(request.budgetPence)&&request.budgetPence>0&&Number.isSafeInteger(listing.totalPence)&&listing.totalPence>0&&listing.totalPence<=request.budgetPence&&Date.parse(request.expiresAt)>now&&Date.parse(listing.expiresAt)>now);
}
export function reviewReasons(listing){
 const reasons=[];
 if(!normalize(listing.registration)) reasons.push('invalid characters or length');
 if(!Number.isSafeInteger(listing.totalPence)||listing.totalPence<5000||listing.totalPence>25000000) reasons.push('price review');
 if(listing.authorised!==true) reasons.push('display permission required');
 if(!['private','trader'].includes(listing.sellerType)) reasons.push('seller type required');
 if(typeof listing.description==='string'&&/V750|V778|V5C|https?:|@|(?:\d[\s-]*){10,}/i.test(listing.description)) reasons.push('possible sensitive or contact information');
 return reasons;
}
// Normalisation is not DVLA format validation or proof of entitlement.
