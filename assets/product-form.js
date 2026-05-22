(function () {
  var form = document.querySelector('[data-product-form]');
  if (!form) return;

  var select = form.querySelector('[data-variant-select]');
  var priceEl = document.getElementById('ProductPrice');
  var submitBtn = form.querySelector('.product-page__submit');
  var buyNowBtn = form.querySelector('[data-buy-now]');
  var returnTo = form.querySelector('#ProductReturnTo');

  function formatMoney(cents) {
    if (window.Shopify && typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents);
    }
    return (cents / 100).toFixed(2);
  }

  function updateFromOption(option) {
    if (!option) return;
    var price = option.getAttribute('data-price');
    var compare = option.getAttribute('data-compare');
    var available = option.getAttribute('data-available') === 'true';
    var mediaId = option.getAttribute('data-media-id');

    if (priceEl && price) {
      var html = formatMoney(parseInt(price, 10));
      if (compare && parseInt(compare, 10) > parseInt(price, 10)) {
        html += ' <s class="product-page__compare">' + formatMoney(parseInt(compare, 10)) + '</s>';
      }
      priceEl.innerHTML = html;
    }
    if (submitBtn) {
      submitBtn.disabled = !available;
      submitBtn.textContent = available ? 'Add to cart' : 'Sold out';
    }
    if (buyNowBtn) {
      buyNowBtn.disabled = !available;
    }
    if (mediaId) {
      document.querySelectorAll('[data-media-id]').forEach(function (el) {
        el.classList.toggle('hidden', el.getAttribute('data-media-id') !== mediaId);
      });
      document.querySelectorAll('[data-thumb-id]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-thumb-id') === mediaId);
      });
    }
  }

  if (select) {
    select.addEventListener('change', function () {
      updateFromOption(select.options[select.selectedIndex]);
    });
  }

  function getVariantId() {
    if (select) return select.value;
    var hidden = form.querySelector('[data-variant-id]');
    return hidden ? hidden.value : null;
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function () {
      var variantId = getVariantId();
      var qtyInput = form.querySelector('#Quantity');
      var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      if (!variantId) return;
      buyNowBtn.disabled = true;
      if (window.LurafiCart) {
        window.LurafiCart.addAndCheckout({ id: variantId, quantity: qty }).catch(function () {
          buyNowBtn.disabled = false;
          if (returnTo) returnTo.value = '/checkout';
          form.submit();
        });
      } else {
        if (returnTo) returnTo.value = '/checkout';
        form.submit();
      }
    });
  }

  document.querySelectorAll('[data-thumb-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-thumb-id');
      document.querySelectorAll('[data-media-id]').forEach(function (el) {
        el.classList.toggle('hidden', el.getAttribute('data-media-id') !== id);
      });
      document.querySelectorAll('[data-thumb-id]').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
    });
  });
})();
