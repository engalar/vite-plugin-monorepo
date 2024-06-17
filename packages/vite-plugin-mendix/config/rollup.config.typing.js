export default args => {
  const result = args.configDefaultConfig;

  // Helper function to find a plugin by name
  const findPluginByName = (plugins, name) => plugins.find(plugin => plugin?.name === name);

  // Initialize the necessary plugins
  let clearPlugin = null;
  let widgetTyping = null;
  let commandPlugin = null;

  // Find the item with clear plugin first
  const clearPluginItem = result.find(item => findPluginByName(item.plugins, "clear"));

  if (clearPluginItem) {
      clearPlugin = findPluginByName(clearPluginItem.plugins, "clear");
      widgetTyping = findPluginByName(clearPluginItem.plugins, "widget-typing");
      commandPlugin = findPluginByName(clearPluginItem.plugins, "command");

      // Check if commandPlugin exists
      if (!commandPlugin) {
          throw new Error("command plugin is required but not found");
      }
  } else {
      throw new Error("clear plugin is required but not found");
  }

  // Regex to filter out items with input match .editorConfig. or .editorPreview.
  const filtered = result.filter(item => /\.editorConfig\./.test(item.input) || /\.editorPreview\./.test(item.input));

  filtered.forEach(item => {
      item.plugins = [widgetTyping, clearPlugin, commandPlugin, ...item.plugins];
  });

  return filtered;
};
