class LayoutHelper {
  sidebarToggle = (toggle) => {
    const minimize = toggle || !this.elClassList.contains("sidebar-minimized");
    this.sidebarMinimize(minimize);
    this.brandMinimize(minimize);
    this.sidebarPSToggle(!minimize); /* remove PS on sidebar minimized */
  };

  sidebarMinimize = (force) => {
    // return this.elClassList.toggle('sidebar-minimized', force);
    return this.toggleClass("sidebar-minimized", force);
  };

  brandMinimize = (force) => {
    // this.elClassList.toggle('brand-minimized', force);
    this.toggleClass("brand-minimized", force);
  };

  sidebarPSToggle = function sidebarPSToggle(toggle) {
    const sidebar = document.querySelector(".sidebar-nav");
    if (sidebar) {
      if (toggle) {
        sidebar.classList.add("ps");
        sidebar.classList.add("ps-container");
        sidebar.classList.add("ps--active-y");
      } else {
        sidebar.classList.remove("ps");
        sidebar.classList.remove("ps-container");
        sidebar.classList.remove("ps--active-y");
      }
    }
  };

  toggleClass = (className, force) => {
    if (force === true) {
      this.elClassList.add(className);
    } else if (force === false) {
      this.elClassList.remove(className);
    } else {
      this.elClassList.toggle(className);
    }
    return this.elClassList.contains(className);
  };
}

export default LayoutHelper;
