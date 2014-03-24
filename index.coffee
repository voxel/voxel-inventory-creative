
Inventory = require 'inventory'
InventoryWindow = require 'inventory-window'
InventoryDialog = (require 'voxel-inventory-dialog').InventoryDialog
ItemPile = require 'itempile'

module.exports = (game, opts) -> new CreativeInventoryPlugin(game, opts)

class CreativeInventoryPlugin extends InventoryDialog
  constructor: (@game, opts) ->
    @registry = game.plugins.get('voxel-registry') ? throw new Error('voxel-creative-inventory requires voxel-registry')

    div = document.createElement 'div'

    @thisInventory = new Inventory(10, 3) # TODO: multi-paged inventory
    @thisIW = new InventoryWindow {inventory:@thisInventory, registry:@registry}

    # TODO: real tabs
    buttons = document.createElement 'div'
    ['items', 'blocks'].forEach (category) =>
      button = document.createElement 'button'
      button.textContent = category # TODO: category icons
      button.addEventListener 'click', () =>
        @populateCategory category

      buttons.appendChild button

    div.appendChild buttons
    div.appendChild @thisIW.createContainer()

    super game, upper: [div]

  enable: () ->
  disable: () ->

  open: () ->
    @populateCategory @activeCategory

    super open

  populateCategory: (category) ->
    category ?= 'items'

    @activeCategory = category

    if category == 'items'
      for item, i in Object.keys(@registry.itemProps)
        @thisInventory.set i, new ItemPile(item, Infinity)
    else if category == 'blocks'
      for i in [1..@registry.blockProps.length]
        name = @registry.getBlockName i
        @thisInventory.set i - 1, new ItemPile(name, Infinity)
      # TODO: read categories from item properties
    else
      console.log 'TODO',category
