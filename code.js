// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// Variables
const COMPONENT_NAME = "fosus-ring";
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    if (msg.type === 'SET_FOCUS_RING') {
        const nodes = figma.currentPage.selection;
        const focusRingComponent = figma.currentPage.findOne(node => node.name === COMPONENT_NAME);
        nodes.forEach((item) => {
            // TODO: Add some types
            if (item.type == "RECTANGLE" || item.type == "ELLIPSE") {
                if (focusRingComponent) { // if component on current page
                    let componentInstance = focusRingComponent.createInstance();
                    componentInstance.resize(item.width, item.height);
                    componentInstance.x = item.x;
                    componentInstance.y = item.y;
                    let groupComponent = figma.group([item, componentInstance], item.parent);
                    groupComponent.name = item.name;
                }
                else { // else create new component
                    const focusRing = getFocusRingComponent(item.width, item.height);
                    focusRing.x = item.x;
                    focusRing.y = item.y;
                    let groupWithRing = figma.group([item, focusRing], item.parent);
                    groupWithRing.name = item.name;
                }
            }
            else {
                figma.ui.postMessage({ type: 'INCORRECT_TYPE_NODE' });
            }
        });
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
figma.on('selectionchange', () => {
    detectSelection();
});
const detectSelection = () => {
    const { selection } = figma.currentPage;
    console.log(selection);
    if (selection.length) {
        figma.ui.postMessage({ type: 'ITEM_SELECTED' });
    }
    else {
        figma.ui.postMessage({ type: 'ITEM_NOT_SELECTED' });
    }
};
const getFocusRingComponent = (width, height) => {
    const focusRingComponent = figma.createComponent();
    const rectOutlineNeutral = figma.createRectangle(); // white
    const rectOutlineAccent = figma.createRectangle(); // blue
    const constr = { horizontal: "STRETCH", vertical: "STRETCH" };
    focusRingComponent.resize(width, height);
    focusRingComponent.name = COMPONENT_NAME;
    rectOutlineNeutral.resize(width, height);
    rectOutlineNeutral.fills = [];
    rectOutlineNeutral.strokes = [{ type: 'SOLID', color: { r: 0.2666666667, g: 0.5333333333, b: 1 }, opacity: .64 }];
    rectOutlineNeutral.strokeWeight = 5;
    rectOutlineNeutral.strokeAlign = "OUTSIDE";
    rectOutlineNeutral.name = "outline-neutral";
    rectOutlineNeutral.cornerRadius = 2;
    rectOutlineNeutral.constraints = constr;
    rectOutlineAccent.resize(width, height);
    rectOutlineAccent.fills = [];
    rectOutlineAccent.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: .9 }];
    rectOutlineAccent.strokeWeight = 1;
    rectOutlineAccent.strokeAlign = "OUTSIDE";
    rectOutlineAccent.name = "outline-accent";
    rectOutlineAccent.cornerRadius = 2;
    rectOutlineAccent.constraints = constr;
    const groupRect = figma.group([rectOutlineNeutral, rectOutlineAccent], focusRingComponent);
    groupRect.name = "standart";
    focusRingComponent.appendChild(groupRect);
    return focusRingComponent;
};
detectSelection();
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
