function BackLinkHelper($module, window, document) {
  this.$module = $module;
  this.window = window;
  this.document = document;
}

BackLinkHelper.prototype.init = function init() {
  // do nothing if History API is absent
  if (this.window.history) {
    /* TODO: Remains unclear whether a check for the same domain is necessary for security reasons.
       There may be user research suggesting considerations regarding the visibility of the
       back link on refresh.
       Currently, a page refresh sets the referer to empty, leading to the back link being hidden
       under our existing logic.
    */
    const referrerAllowList = ['account-np.hmrc.gov.uk', 'account.hmrc.gov.uk'];
    const shouldHideBackLink = () => {
      const referer = this.document.referrer;
      if (!referer) return true;
      const referredFromDifferentDomain = () => referer.indexOf(this.window.location.host) === -1;
      const referrerNotOnAllowList = () => !referrerAllowList.some(
        (allowListedDomain) => referer.includes(allowListedDomain),
      );
      return referredFromDifferentDomain() && referrerNotOnAllowList();
    };

    // hide the backlink if the referrer is on a different domain or the referrer is not set
    if (shouldHideBackLink()) {
      this.$module.classList.add('hmrc-hidden-backlink');
    } else {
      // prevent resubmit warning
      if (this.window.history.replaceState && typeof this.window.history.replaceState === 'function') {
        this.window.history.replaceState(null, null, this.window.location.href);
      }

      this.$module.addEventListener('click', (event) => {
        event.preventDefault();
        if (this.window.history.back && typeof this.window.history.back === 'function') {
          this.window.history.back();
        }
      });
    }
  }
};

export default BackLinkHelper;
