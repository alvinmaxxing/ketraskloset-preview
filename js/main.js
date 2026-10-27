(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var piece = (form.querySelector("[name=piece]") || {}).value || "";
      var message = (form.querySelector("[name=message]") || {}).value || "";
      var text = "Hi! I'm " + name + "." + (piece ? " Interested in: " + piece + "." : "") + (message ? " " + message : "");
      var wa = (window.KETRAS_WHATSAPP || "https://wa.me/256700929189") + "?text=" + encodeURIComponent(text);
      var success = document.getElementById("form-success");
      if (success) {
        success.style.display = "block";
        success.innerHTML = 'Opening WhatsApp… <a href="' + wa + '" target="_blank" rel="noopener">tap here if it doesn\'t open</a>.';
      }
      window.open(wa, "_blank", "noopener");
      form.reset();
    });
  }
})();

window.renderProductCard = function (product) {
  var badge = "";
  if (product.available === false) badge = '<span class="badge-sold">Sold out</span>';
  else if (product.sale) badge = '<span class="badge-sale">Sale</span>';
  var imgs = window.productThumbs(product);
  var name = window.escAttr(product.name);
  var count = imgs.length > 1 ? '<span class="look-count">' + imgs.length + ' looks</span>' : '';
  var alt = imgs.length > 1 ? '<img class="img-alt" src="' + imgs[1] + '" alt="" loading="lazy" aria-hidden="true">' : '';
  var dots = '';
  if (imgs.length > 1) {
    dots = '<span class="card-dots">';
    for (var i = 0; i < Math.min(imgs.length, 6); i++) dots += '<i' + (i === 0 ? ' class="on"' : '') + '></i>';
    dots += '</span>';
  }
  var pid = window.escAttr(product.id), sold = product.available === false;
  clearTimeout(window.__kkCardT); window.__kkCardT = setTimeout(function () { if (window.KK_BASKET) window.KK_BASKET.paint(); if (window.KK_REVIEWS) window.KK_REVIEWS.paintCards(); }, 30);
  var waUrl = window.whatsAppLink ? window.whatsAppLink(product) : "#";
  return (
    '<div class="kk-card">' +
    '<button type="button" class="kk-heart" data-kk-fav="' + pid + '" aria-pressed="false" aria-label="Save to favourites">' + (window.KK_ICON_HEART || '&#9825;') + '</button>' +
    '<a class="product-card" href="piece.html?id=' + encodeURIComponent(product.id) + '">' +
      '<div class="thumb' + (imgs.length > 1 ? ' has-alt' : '') + '">' + badge + count +
        '<img class="img-main" src="' + imgs[0] + '" alt="' + name + '" loading="lazy">' + alt + dots +
        '<span class="card-cta">View every look</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="meta-line">' + product.category + ' &middot; ' + product.color + '</div>' +
        '<h3>' + product.name + '</h3>' +
        '<div class="price' + (product.sale ? ' price-sale' : '') + '">' + window.formatPrice(product) + (product.sale ? '<span class="sale-tag">Sale</span>' : '') + '</div>' +
        '<div class="kk-rating" data-kk-rating="' + pid + '"></div>' +
      '</div>' +
    '</a>' +
    '<div class="kk-card-actions">' +
      (sold ? '<span class="kk-btn kk-btn-line kk-disabled">Sold out</span>' : '<button type="button" class="kk-btn kk-btn-dark" data-kk-addcard="' + pid + '">Add to basket</button>') +
      '<a class="kk-wa-link" href="' + waUrl + '" target="_blank" rel="noopener" aria-label="Ask about this piece on WhatsApp">' + (window.KETRAS_WA_ICON || '') + '<span>WhatsApp</span></a>' +
    '</div>' +
    '</div>'
  );
};
