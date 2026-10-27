window.KETRAS_PRODUCTS = [];
window.KETRAS_CATALOG_META = null;
window.KETRAS_WHATSAPP = "https://wa.me/256700929189";
window.KETRAS_PHONE_DISPLAY = "+256 700 929 189";
window.KETRAS_WA_ICON = '<svg class="wa-logo" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#25D366"/><path transform="translate(6.4 6.2) scale(.8)" fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
window.productImages = function (p) { return (p && p.images && p.images.length) ? p.images : (p && p.image ? [p.image] : []); };
window.productThumbs = function (p) { var t = p && p.thumbs; var i = window.productImages(p); return (t && t.length === i.length) ? t : i; };
window.escAttr = function (s) { return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); };

window.formatPrice = function (p) {
  var n = (p && typeof p === "object") ? p.price_ugx : p;
  if (n == null || n === "") return "Price on request";
  return "UGX " + Number(n).toLocaleString("en-US");
};

window.getProduct = function (id) {
  return window.KETRAS_PRODUCTS.find(function (p) { return p.id === id; });
};

window.getAvailableProducts = function () {
  return window.KETRAS_PRODUCTS.filter(function (p) { return p.available !== false; });
};

window.whatsAppLink = function (product) {
  var base = window.KETRAS_WHATSAPP;
  if (!product) return base;
  var msg = "Hi Ketras Kloset! I'd like to buy: " + product.name + " (" + product.id + ") — " + window.formatPrice(product);
  return base + "?text=" + encodeURIComponent(msg);
};

window.loadKetrasCatalog = function () {
  return fetch("js/products.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      window.KETRAS_PRODUCTS = data.products || data || [];
      window.KETRAS_CATALOG_META = data._meta || null;
      return window.KETRAS_PRODUCTS;
    })
    .catch(function () {
      window.KETRAS_PRODUCTS = [];
      return window.KETRAS_PRODUCTS;
    });
};

window.KETRAS_CATALOG_READY = window.loadKetrasCatalog();
