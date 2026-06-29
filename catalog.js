/* FishAnneChips — catalog renderer
   Reads the Google Sheet (published as CSV) and fills any [data-listings]
   container on the page. Filter via data attributes:
     data-category="Golf" | "Fly Fishing"
     data-subcategory="New Apparel" | "Pre-owned Apparel" | "Gear" | "Vintage Gear"
     data-featured="true"   (landing page subset)
     data-empty="message"   (shown when nothing matches)
   No build step, no dependencies. */
(function () {
  var SHEET_ID = '1otK4w56uwxOJ4ICNvO3pikcZlfz8gzkou3EkuHIbrgA';
  var CSV_URL =
    'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv';

  // Subcategories that are affiliate (get rel="sponsored" + disclosure)
  var AFFILIATE_SUBS = ['new apparel', 'gear'];
  var SUB_TAG = {
    'new apparel': 'New',
    'pre-owned apparel': 'Pre-owned',
    'gear': 'Gear',
    'vintage gear': 'Vintage'
  };

  function trim(s) { return (s == null ? '' : String(s)).trim(); }
  function lc(s) { return trim(s).toLowerCase(); }
  function truthy(s) { return lc(s) === 'true'; }
  function esc(s) {
    return trim(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Normalize for matching — forgive the "apperal" typo, casing, and spacing.
  function subKey(s) { return lc(s).replace(/apperal/g, 'apparel').replace(/\s+/g, ' '); }
  function catKey(s) { return lc(s).replace(/\s+/g, ' '); }
  function isAffiliate(sub) { return AFFILIATE_SUBS.indexOf(subKey(sub)) !== -1; }

  // Minimal RFC-4180 CSV parser (handles quotes, commas + newlines in fields).
  function parseCSV(text) {
    var rows = [], row = [], field = '', inQ = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQ = false;
        } else field += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (c !== '\r') field += c;
      }
    }
    row.push(field); rows.push(row);
    return rows;
  }

  function toItems(rows) {
    if (!rows.length) return [];
    var head = rows[0].map(trim);
    var iFeat = head.indexOf('Featured'),
        iAct = head.indexOf('Active'),
        iCat = head.indexOf('Category'),
        iSub = head.indexOf('Subcategory'),
        iTit = head.indexOf('Title'),
        iImg = head.indexOf('Image URL'),
        iLink = head.indexOf('Listing URL');
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      var item = {
        featured: truthy(row[iFeat]),
        active: truthy(row[iAct]),
        category: trim(row[iCat]),
        subcategory: trim(row[iSub]),
        title: trim(row[iTit]),
        image: trim(row[iImg]),
        link: trim(row[iLink])
      };
      // Only show active rows that at least have a title + category.
      if (item.active && item.title && item.category) out.push(item);
    }
    return out;
  }

  function cardHTML(item) {
    var aff = isAffiliate(item.subcategory);
    var rel = aff ? 'sponsored noopener' : 'noopener';
    var tag = SUB_TAG[subKey(item.subcategory)] || item.subcategory || 'Item';
    var hasImg = !!item.image;
    var hasLink = !!item.link;

    var imgInner = hasImg
      ? '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy" />'
      : 'Photo';
    var imgEl = hasLink
      ? '<a class="product-img' + (hasImg ? '' : ' is-empty') + '" href="' + esc(item.link) +
        '" target="_blank" rel="' + rel + '">' + imgInner + '</a>'
      : '<div class="product-img' + (hasImg ? '' : ' is-empty') + '">' + imgInner + '</div>';

    var btn = hasLink
      ? '<a class="btn btn-small btn-primary" href="' + esc(item.link) +
        '" target="_blank" rel="' + rel + '">View on eBay →</a>'
      : '<a class="btn btn-small btn-primary" href="#" data-placeholder>Listing coming soon</a>';

    return '<article class="product">' + imgEl +
      '<div class="product-body">' +
        '<span class="product-condition' + (aff ? ' affiliate' : '') + '">' + esc(tag) + '</span>' +
        '<h3>' + esc(item.title) + '</h3>' +
        btn +
      '</div></article>';
  }

  function render(items) {
    document.querySelectorAll('[data-listings]').forEach(function (box) {
      var cat = box.getAttribute('data-category');
      var sub = box.getAttribute('data-subcategory');
      var feat = box.getAttribute('data-featured') === 'true';
      var list = items.filter(function (it) {
        if (cat && catKey(it.category) !== catKey(cat)) return false;
        if (sub && subKey(it.subcategory) !== subKey(sub)) return false;
        if (feat && !it.featured) return false;
        return true;
      });
      if (list.length) {
        box.innerHTML = list.map(cardHTML).join('');
      } else {
        var msg = box.getAttribute('data-empty') || 'Nothing here yet — check back soon.';
        box.innerHTML = '<p class="empty-note">' + esc(msg) + '</p>';
      }
    });
    bindPlaceholders();
  }

  // Bind the "Listing coming soon" pulse on freshly injected cards.
  function bindPlaceholders() {
    document.querySelectorAll('[data-listings] [data-placeholder]').forEach(function (el) {
      if (el._bound) return;
      el._bound = true;
      el.addEventListener('click', function (e) {
        if (el.getAttribute('href') === '#') {
          e.preventDefault();
          el.classList.add('is-pending');
          setTimeout(function () { el.classList.remove('is-pending'); }, 1000);
        }
      });
    });
  }

  function fail() {
    document.querySelectorAll('[data-listings]').forEach(function (box) {
      box.innerHTML = '<p class="empty-note">Listings are taking a moment to load — please refresh.</p>';
    });
  }

  if (!document.querySelector('[data-listings]')) return; // nothing to render on this page

  fetch(CSV_URL)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function (text) { render(toItems(parseCSV(text))); })
    .catch(function (e) { console.error('catalog load failed', e); fail(); });
})();
