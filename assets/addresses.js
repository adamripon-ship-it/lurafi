(function () {
  function populateProvinces(countrySelect, provinceSelect) {
    var selectedOption = countrySelect.options[countrySelect.selectedIndex];
    if (!selectedOption) return;

    var raw = selectedOption.getAttribute('data-provinces');
    var provinces = [];
    try {
      provinces = raw ? JSON.parse(raw) : [];
    } catch (e) {
      provinces = [];
    }

    provinceSelect.innerHTML = '';

    if (provinces.length === 0) {
      provinceSelect.setAttribute('hidden', 'hidden');
      provinceSelect.disabled = true;
      return;
    }

    provinceSelect.removeAttribute('hidden');
    provinceSelect.disabled = false;

    var defaultValue = provinceSelect.getAttribute('data-default') || '';

    provinces.forEach(function (pair) {
      var option = document.createElement('option');
      option.value = pair[0];
      option.textContent = pair[1];
      if (pair[0] === defaultValue || pair[1] === defaultValue) {
        option.selected = true;
      }
      provinceSelect.appendChild(option);
    });
  }

  function wire(scope) {
    var countrySelects = scope.querySelectorAll('select[name="address[country]"]');
    countrySelects.forEach(function (countrySelect) {
      var form = countrySelect.closest('form');
      if (!form) return;

      var provinceSelect = form.querySelector('select[name="address[province]"]');
      if (!provinceSelect) return;

      var defaultCountry = countrySelect.getAttribute('data-default');
      if (defaultCountry) {
        var match = Array.from(countrySelect.options).find(function (opt) {
          return opt.value === defaultCountry;
        });
        if (match) match.selected = true;
      }

      populateProvinces(countrySelect, provinceSelect);

      countrySelect.addEventListener('change', function () {
        provinceSelect.setAttribute('data-default', '');
        populateProvinces(countrySelect, provinceSelect);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { wire(document); });
  } else {
    wire(document);
  }
})();
