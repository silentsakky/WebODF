Ext.BLANK_IMAGE_URL = './ext/resources/images/default/s.gif';

Ext.onReady(function(){

  Ext.QuickTips.init();

  var tabpanel = new Ext.TabPanel({
    region:'center',
  });

  var tree = new Ext.tree.TreePanel({
    title: 'Documents',
    region: 'west',
    width: 200,
    split: true,
    autoScroll: true,
    collapsible: true,
    rootVisible: false,
    enableTabScroll:true,
    defaults: {autoScroll:true},
    root: { nodeType: 'node' },
  });

  var thumbgrid = new Ext.Panel({
    width: 200,
    split: true,
    collapsible: true,
    region: 'east',
    title: 'Animated DataView',
    layout: 'fit',
    //    items : dataview,
  });

  var viewport = new Ext.Viewport({
    layout: 'border',
    items: [ tabpanel, tree ]
  });

  function getParentNode(root, uri) {
    var parts = uri.split('/');
    var node = root;
    var id = parts[0];
    for (var i = 1; i<parts.length-1; ++i) {
      var n = node.findChild('text', parts[i], false);
      id += '/' + parts[i];
      if (!n) {
        n = {
          id: id,
          text: parts[i],
          qtip: uri,
          cls: 'folder',
          editable: false,
          nodeType: 'node',
          singleClickExpand: true
        };
        n = node.appendChild(n);
      }
      node = n;
    }
    return node;
  }

  function listFilesCallback(directories, files) {
    var root = tree.getRootNode();
    for (var i in files) {
      var f = files[i];
      if (typeof f == 'string') {
        var parentNode = getParentNode(root, f);
        var qtip = f;
        var thumbdataurl = getThumbUrl(f);
        if (thumbdataurl) {
          qtip += '<img src="' + thumbdataurl + '"/>';
        }
        parentNode.appendChild({
          id: f,
          qtip: qtip,
          text: f.substr(f.lastIndexOf('/')+1),
          cls: 'file',
          leaf: true,
          editable: false,
          listeners: {
            click: function(node) { loadODF(node.id, tabpanel, node.text); }
          }
        });
      }
    }
  }
  function listFilesDoneCallback() {
  }

  // put data in the tree
  listFiles('kofficetests/', /\.od[tps]$/i, listFilesCallback,
    listFilesDoneCallback);
});

function getThumbUrl(url) {
  var data;
  try {
    var zip = new jsodfkit.Zip(url);
    data = zip.load('Thumbnails/thumbnail.png');
  } catch (e) {
    return null;
  }
  if (data) {
      return 'data:;base64,' + Base64.toBase64(data);
  }
  return null;
}

function loadODF(url, panel, title) {
  var tab = panel.find('url', url);
  if (tab.length) {
    for (var t in tab) {
      if (typeof tab[t] == 'object') {
        panel.setActiveTab(tab[t]);
        return;
      }
    }
  }
  var newTab = new Ext.BoxComponent({
    title: title,
    tabTip: url,
    url: url,
    closable: true,
    autoEl: {
        tag: 'iframe',
        name: url,
        src: 'odf.html#' + url,
        frameBorder: 0,
        style: {
            border: '0 none'
        }
    },
    region: 'center'
  });
  panel.add(newTab);
  panel.setActiveTab(newTab);
}
