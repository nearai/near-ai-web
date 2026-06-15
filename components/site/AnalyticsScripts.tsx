import Script from "next/script";

const attributionScript = `(function() {
  'use strict';

  // 1. PARSE & STORE ATTRIBUTION
  var params = new URLSearchParams(window.location.search);
  var attribution = {
    utm_source: params.get('utm_source') || 'direct',
    utm_medium: params.get('utm_medium') || 'none',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    twclid: params.get('twclid') || '',
    gclid: params.get('gclid') || '',
    fbclid: params.get('fbclid') || '',
    li_fat_id: params.get('li_fat_id') || '',
    timestamp: new Date().toISOString()
  };
  if (!localStorage.getItem('first_touch_attribution')) {
    localStorage.setItem('first_touch_attribution', JSON.stringify(attribution));
  }
  localStorage.setItem('last_touch_attribution', JSON.stringify(attribution));
  window.__attribution = attribution;

  // 2. POSTHOG
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture identify alias people.set register reset get_distinct_id".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('phc_glaMeuuO1gLFSB2U9y27MchidXEmSnFOQLB8cceyVSb', {
    api_host: 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    person_profiles: 'always',
    persistence: 'localStorage+cookie',
    cookie_expiration: 90,
    cross_subdomain_cookie: true,
    cookie_domain: '.nearaibackup.aurora33.site'
  });
  posthog.capture('page_view', {
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
    twclid: attribution.twclid,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    li_fat_id: attribution.li_fat_id,
    timestamp: attribution.timestamp,
    device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  });

  // 3. X (TWITTER) PIXEL
  !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
  twq('config','o15hi');
  twq('config','qkpem');
  twq('track','PageView');

  // 4. EVENT HELPER
  window.trackEvent = function(eventName, properties) {
    posthog.capture(eventName, Object.assign({}, properties, window.__attribution));
  };
})();`;

const linkedinScript = `(function(l) {
  if (!l) {
    window.lintrk = function(a, b) { window.lintrk.q.push([a, b]); };
    window.lintrk.q = [];
  }
  var s = document.getElementsByTagName("script")[0];
  var b = document.createElement("script");
  b.type = "text/javascript";
  b.async = true;
  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.parentNode.insertBefore(b, s);
})(window.lintrk);`;

const ctaTrackingScript = `(function() {
  var productPatterns = [
    { pattern: 'cloud.nearaibackup.aurora33.site', product: 'cloud_near' },
    { pattern: 'private.nearaibackup.aurora33.site', product: 'private_chat' }
  ];

  function getPlacement(element) {
    var rect = element.getBoundingClientRect();
    var scrollY = window.scrollY;
    var absoluteTop = rect.top + scrollY;
    var viewportHeight = window.innerHeight;
    if (absoluteTop < viewportHeight * 0.8) return 'hero';
    if (absoluteTop < viewportHeight * 2) return 'mid';
    return 'footer';
  }

  function init() {
    productPatterns.forEach(function(item) {
      var links = document.querySelectorAll('a[href*="' + item.pattern + '"]');
      links.forEach(function(link, index) {
        link.addEventListener('click', function() {
          var buttonText = link.textContent.trim();
          var placement = getPlacement(link);
          posthog.capture('cta_clicked', Object.assign({
            button_id: item.product + '_' + placement + '_' + index,
            button_text: buttonText,
            product: item.product,
            placement: placement,
            destination_url: link.href,
            page_url: window.location.href,
            page_path: window.location.pathname
          }, window.__attribution));
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;

export default function AnalyticsScripts() {
  return (
    <>
      {/* Attribution + PostHog + Twitter Pixel */}
      <Script
        id="analytics-attribution"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: attributionScript }}
      />
      {/* LinkedIn Insight Tag */}
      <Script
        id="analytics-linkedin"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `_linkedin_partner_id = "8307282"; window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []; window._linkedin_data_partner_ids.push(_linkedin_partner_id); ${linkedinScript}`}
        }
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src="https://px.ads.linkedin.com/collect/?pid=8307282&fmt=gif"
        />
      </noscript>
      {/* CTA Click Tracking */}
      <Script
        id="analytics-cta-tracking"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{ __html: ctaTrackingScript }}
      />
    </>
  );
}
