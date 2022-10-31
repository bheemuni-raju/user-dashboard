module.exports = {
  getEmailFromOrgArray: function (organizations) {
    let emails = []
    for (let item of organizations) {
      if (item?.configuration?.domain) {
        emails.push(...item.configuration.domain)
      }
    }
    return emails
  }
}