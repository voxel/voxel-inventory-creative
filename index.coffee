
InventoryDialog = (require 'voxel-inventory-dialog').InventoryDialog

module.exports = (game, opts) -> new CreativeInventoryPlugin(game, opts)

class CreativeInventoryPlugin extends InventoryDialog
  constructor: (@game, opts) ->

    div = document.createElement 'div'
    div.textContent = 'hello world'

    super game, upper: [div]

  enable: () ->
  disable: () ->


