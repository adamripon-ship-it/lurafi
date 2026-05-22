document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

class HTMLUpdateUtility {
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));
    const newNodeWrapper = document.createElement('div');
    newNodeWrapper.appendChild(newContent.cloneNode(true));
    oldNode.replaceWith(newNodeWrapper.firstElementChild);
    postProcessCallbacks?.forEach((callback) => callback(newContent));
  }
}

window.HTMLUpdateUtility = HTMLUpdateUtility;
