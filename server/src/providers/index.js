const OllamaProvider = require('./ollama.provider');

class ProviderFactory {
  static create() {
    return new OllamaProvider();
  }
}

module.exports = { ProviderFactory, OllamaProvider };