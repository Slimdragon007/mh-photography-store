export type CartItem = { id: string; qty: number; price?: number; title?: string };
let _cart: CartItem[] = [];
export function getCart(){ return _cart; }
export function addToCart(item: CartItem){ const i=_cart.findIndex(x=>x.id===item.id); if(i>=0)_cart[i].qty += item.qty ?? 1; else _cart.push({ ...item, qty: item.qty ?? 1 }); return _cart; }
export function removeFromCart(id: string){ _cart = _cart.filter(x=>x.id!==id); return _cart; }
export function clearCart(){ _cart=[]; return _cart; }
