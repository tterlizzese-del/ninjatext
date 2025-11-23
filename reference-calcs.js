(function () {
  const groups = {};

  const formatNumber = (value, decimals = 2) => {
    if (!isFinite(value)) return '--';
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;
    if (Number.isInteger(rounded)) {
      return String(rounded);
    }
    return rounded.toFixed(decimals).replace(/\.?0+$/, '');
  };

  const updateGroup = (name) => {
    const group = groups[name];
    if (!group) return;
    const weight = group.weight;
    group.outputs.forEach((el) => {
      if (!isFinite(weight) || weight <= 0) {
        el.textContent = '--';
        return;
      }
      const decimals = Number.isFinite(parseInt(el.dataset.doseDecimals, 10))
        ? parseInt(el.dataset.doseDecimals, 10)
        : 2;
      const unit = el.dataset.doseUnit || '';
      const period = el.dataset.dosePeriod || '';
      const low = parseFloat(el.dataset.doseLow);
      const high = parseFloat(el.dataset.doseHigh);
      const single = parseFloat(el.dataset.doseValue ?? el.dataset.doseSingle);

      const formatWithUnit = (value, maxAttr) => {
        let computed = value * weight;
        const maxValue = parseFloat(el.dataset[maxAttr]) || parseFloat(el.dataset.doseMax);
        let capped = false;
        if (isFinite(maxValue) && computed > maxValue) {
          computed = maxValue;
          capped = true;
        }
        let text = formatNumber(computed, decimals);
        if (unit) {
          text += ' ' + unit;
        }
        if (period) {
          text += '/' + period;
        }
        if (capped) {
          text += ' (max)';
        }
        return text;
      };

      let output = '--';
      if (isFinite(low) && isFinite(high)) {
        const lowText = formatWithUnit(low, 'doseMaxLow');
        const highText = formatWithUnit(high, 'doseMaxHigh');
        output = lowText + ' – ' + highText;
      } else if (isFinite(low)) {
        output = formatWithUnit(low, 'doseMaxLow');
      } else if (isFinite(high)) {
        output = formatWithUnit(high, 'doseMaxHigh');
      } else if (isFinite(single)) {
        output = formatWithUnit(single, 'doseMax');
      }
      el.textContent = output;
    });
  };

  const registerGroup = (name) => {
    if (!groups[name]) {
      groups[name] = { weight: NaN, outputs: [], inputs: [] };
    }
    return groups[name];
  };

  document.querySelectorAll('[data-weight-input]').forEach((input) => {
    const name = input.dataset.doseGroup || 'default';
    const group = registerGroup(name);
    group.inputs.push(input);
    const current = parseFloat(input.value);
    if (isFinite(current) && current > 0) {
      group.weight = current;
    }
    input.addEventListener('input', () => {
      const value = parseFloat(input.value);
      group.weight = isFinite(value) && value > 0 ? value : NaN;
      updateGroup(name);
    });
  });

  document.querySelectorAll('[data-dose-group]').forEach((el) => {
    const name = el.dataset.doseGroup || 'default';
    const group = registerGroup(name);
    group.outputs.push(el);
  });

  Object.keys(groups).forEach(updateGroup);
})();
