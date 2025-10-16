/**
 * Makes URLs in text content clickable by converting them to anchor tags
 * @param element - The DOM element to process
 */
export const makeLinksClickable = (element: HTMLElement) => {
  // Regex to find URLs (http/https/ftp)
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  
  // Find all text nodes in the element
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  const textNodes: Node[] = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }
  
  textNodes.forEach((textNode) => {
    const text = textNode.textContent;
    if (text && urlRegex.test(text)) {
      const parent = textNode.parentNode;
      const newHTML = text.replace(
        urlRegex,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline transition-colors">$1</a>'
      );
      
      if (newHTML !== text && parent) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = newHTML;
        
        // Replace the text node with the new nodes
        while (tempDiv.firstChild) {
          parent.insertBefore(tempDiv.firstChild, textNode);
        }
        parent.removeChild(textNode);
      }
    }
  });
};

