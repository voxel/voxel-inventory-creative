'use strict';

const Inventory = require('inventory');
const InventoryWindow = require('inventory-window');
const InventoryDialog = require('voxel-inventory-dialog').InventoryDialog;
const ItemPile = require('itempile');

module.exports = (game, opts) => new CreativeInventoryPlugin(game, opts);
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-carry']
}

class CreativeInventoryPlugin extends InventoryDialog {
  constructor(game, opts) {
    const registry = game.plugins.get('voxel-registry');
    if (!registry) throw new Error('voxel-creative-inventory requires voxel-registry')

    const div = document.createElement('div');

    const thisInventory = new Inventory(10, 3); // TODO: multi-paged inventory
    if (!game.plugins.get('voxel-carry')) throw new Error('voxel-inventory-creative requires voxel-carry');
    const playerInventory = game.plugins.get('voxel-carry').inventory;
    const thisIW = new InventoryWindow({inventory:thisInventory, registry:registry, linkedInventory:playerInventory});

    const buttons = document.createElement('div');
    div.appendChild(buttons);
    div.appendChild(thisIW.createContainer());

    super(game, {upper: [div]});

    this.game = game;
    this.hideHiddenItems = opts.hideHiddenItems !== undefined ? opts.hideHiddenItems : true;
    this.registry = registry;
    this.thisInventory = thisInventory;
    this.thisIW = thisIW;
    this.buttons = buttons;
  }

  enable() {
  }

  disable() {
  }

  open() {
    const categories = this.scanCategories();
    this.addButtons(categories);
    this.populateCategory(categories, this.activeCategory);

    super.open();
  }

  addButtons(categories) {
    while(this.buttons.firstChild) {
      this.buttons.removeChild(this.buttons.firstChild);
    }

    // sort categories, items and blocks always first
    const categoryNames = Object.keys(categories);
    categoryNames.sort((a, b) => {
      if (a === 'items') a = '0items';
      if (a === 'blocks') a = '1blocks';
      if (b === 'items') b = '0items';
      if (b === 'blocks') b = '1blocks';

      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });

    // TODO: real tabs?
    categoryNames.forEach((category) => {
      const button = document.createElement('button');
      button.textContent = category; // TODO: category icons
      button.addEventListener('click', () => {
        //  rescan and populate
        this.populateCategory(this.scanCategories(), category);
      });

      this.buttons.appendChild(button);
    })
  }

  // Scan all items/blocks and return object with categories to item names
  // Note: items/blocks can be registered at any time! Recall for latest data.
  scanCategories() {
    const categories = {};

    // TODO: add a proper API in voxel-registry to get all items and blocks

    // scan for all categories
    for (let name of Object.keys(this.registry.itemProps)) {
      const props = this.registry.itemProps[name];

      const category = props.creativeTab !== undefined ? props.creativeTab : 'items';
      if (category === false) continue;

      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    // group items into their category
    for (let blockIndex of Object.keys(this.registry.blockProps)) {
      if ((blockIndex|0) === 0) continue; // skip air
      const props = this.registry.blockProps[blockIndex];

      const name = this.registry.getBlockName(blockIndex);
      const category = props.creativeTab !== undefined ? props.creativeTab : 'blocks';
      if (category === false && this.hideHiddenItems) continue; // special case to hide (for internal technical blocks, etc.)

      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    // TODO: maybe leave unsorted, so items from the same plugin are grouped together?
    // or perhaps better yet, somehow track the plugin that registered each item?
    for (let category of Object.keys(categories)) {
      const items = categories[category];
      items.sort();
    }

    console.log(categories);
    return categories;
  }

  populateCategory(categories, category) {
    if (!category) category = 'items';
    this.activeCategory = category;

    this.thisInventory.clear();

    const items = categories[category];
    if (!items) items = [];

    for (let i = 0; i < items.length; ++i) {
      const name = items[i];
      this.thisInventory.set(i, new ItemPile(name, Infinity));
    }
  }
}
