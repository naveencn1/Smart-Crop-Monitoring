import BasePage from './basePage.js';
import logger from '../utilities/logger.js';

export class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get welcomeHeader() { return 'id:com.example.app:id/tv_welcome_title'; }
  get cropRecyclerView() { return 'id:com.example.app:id/rv_crops_list'; }
  get cropItemCard() { return 'id:com.example.app:id/card_crop_item'; }
  
  // Navigation Drawer (Side)
  get navDrawerOpenBtn() { return 'accessibility id:Open navigation drawer'; }
  get navDrawerLogoutBtn() { return 'id:com.example.app:id/nav_logout'; }
  get navDrawerProfileBtn() { return 'id:com.example.app:id/nav_profile'; }
  
  // Bottom Navigation
  get tabHome() { return 'id:com.example.app:id/action_home'; }
  get tabAlerts() { return 'id:com.example.app:id/action_alerts'; }
  get tabDrone() { return 'id:com.example.app:id/action_drone'; }
  get tabForm() { return 'id:com.example.app:id/action_form_wizard'; }

  /**
   * Asserts whether the dashboard screen is successfully displayed
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    this.startPerformanceTimer('Dashboard_Load');
    try {
      const el = await this.waitForDisplayed(this.welcomeHeader, 8000);
      const isVisible = await el.isDisplayed();
      const loadTime = this.stopPerformanceTimer('Dashboard_Load');
      logger.info(`Dashboard loaded in ${loadTime}ms`);
      return isVisible;
    } catch (err) {
      logger.error('Dashboard failed to load.');
      return false;
    }
  }

  /**
   * Navigates to a specific tab using bottom navigation bar.
   * @param {'home'|'alerts'|'drone'|'form'} tab 
   */
  async navigateToTab(tab) {
    logger.info(`Navigating to tab: ${tab}`);
    let tabSelector;
    switch (tab) {
      case 'home': tabSelector = this.tabHome; break;
      case 'alerts': tabSelector = this.tabAlerts; break;
      case 'drone': tabSelector = this.tabDrone; break;
      case 'form': tabSelector = this.tabForm; break;
      default: throw new Error(`Invalid bottom tab: ${tab}`);
    }
    await this.click(tabSelector);
  }

  /**
   * Executes the logout flow through the navigation drawer
   */
  async logout() {
    logger.info('Performing Logout sequence');
    await this.click(this.navDrawerOpenBtn);
    await this.click(this.navDrawerLogoutBtn);
  }

  /**
   * Retrieves count of items in the crops list.
   * @returns {Promise<number>}
   */
  async getCropItemsCount() {
    try {
      const items = await this.driver.$$(this.cropItemCard);
      return items.length;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Clicks on a crop item in the recycler view by its index.
   * @param {number} index 
   */
  async selectCropItem(index) {
    logger.info(`Selecting crop item at index: ${index}`);
    const items = await this.driver.$$(this.cropItemCard);
    if (items.length > index) {
      await items[index].click();
    } else {
      throw new Error(`Crop item at index ${index} is not available. Total items: ${items.length}`);
    }
  }
}

export default DashboardPage;
