import { Css, EdgeDataDefinition, ElementDefinition, ElementGroup, NodeDataDefinition, Position } from 'cytoscape'


/**
 * Cytoscape用のインターフェース
 */
export class NetElement implements ElementDefinition{
  group?: ElementGroup;
  data: NodeDataDefinition | EdgeDataDefinition;
  scratch?: any;
  position?: Position;
  renderedPosition?: Position;
  selected?: boolean;
  selectable?: boolean;
  locked?: boolean;
  grabbable?: boolean;
  classes?: string;
  style?: any;
  css?: Css.Node | Css.Edge;

  constructor(id: string){
    this.data = {
      id: id,
      name: id
    }
  }

  getId(){
    return this.data.id
  }

  getName(){
    return this.data.name
  }
}

export class Host extends NetElement {

  constructor(id: string){
    super(id);
    this.group = "nodes"
    this.classes = "host"
    this.style = {
      'shape': 'rectangle',
      'height': 62,
      'width': 75,
      'background-image': 'img/workstation.jpg'
    }
  }
}

export class SRv6Node extends NetElement {

  constructor(id: string){
    super(id);
    this.group = "nodes"
    this.classes = "srv6-node"
    this.style = {
      'shape': 'rectangle',
      'height': 51,
      'width': 102,
      'background-image': 'img/workgroup_switch.jpg'
    }
  }

}

export class Link extends NetElement {

  constructor(id: string, node1: string, node2: string){
    super(id);
    this.group = "edges"
    this.classes = "link"
    this.data.source = node1
    this.data.target = node2
  }

  getNode1(){
    return this.data.source
  }

  getNode2(){
    return this.data.target
  }
}

export class PacketArc extends Link{

  constructor(id: string, src: string, dst: string){
    super(id, src, dst)
    this.classes = "link packet-arc"
  }

  getSource(){
    return this.data.source
  }

  getDestination(){
    return this.data.target
  }
}

