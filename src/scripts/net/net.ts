/**
 * Cytscape js のラッパー
 * 
 * ## ref:
 *  * スタイルについては，`https://github.com/cytoscape/cytoscape.js/blob/b9b0797c85e8bf8e8c071b0acd08d0b4e790de19/documentation/md/style.md`_ を参照．
 */

import cytoscape, { EventObject, Core, CollectionReturnValue, CytoscapeOptions, NodeSingular, EdgeSingular, ElementDefinition, CollectionArgument } from 'cytoscape'
import { Host, SRv6Node, Link, NetElement, PacketArc } from './elements'
// @ts-ignore
import gtip from 'cytoscape-qtip'

gtip(cytoscape)


/**
 * Cytoscape Wrapper
 */
export class SRv6Network{

  /**
   * cytoscape obj
   */
  private cytoscape: Core;

  /**
   * Cytoscape Options
   */
  private options: CytoscapeOptions

  /**
   * Element Definitions of host
   */
  private hosts: Host[]

  /**
   * Element Definitions of host
   */
  private srv6Nodes: SRv6Node[]

  /**
   * Element Definitions of link
   */
  private links: Link[]

  /**
   * others
   */
  private otherElements: NetElement[]

  constructor(element: HTMLElement, style?: cytoscape.Stylesheet[] | Promise<cytoscape.Stylesheet[]>){
    this.options = {}
    this.options.container = element
    this.options.style = style ?? [{
      selector: 'nodes',
      style: {
        'label': 'data(name)'
      }
    },{
      selector: '.link',
      style: {
        'background-opacity': 0.5,
      }
    },{
      selector: '.packet-arc',
      style: {
        'target-arrow-color': '#ee2222',
        'target-arrow-shape': 'triangle',
        'line-color': '#ee2222',
        'curve-style': 'bezier',
        'width' : 5
        // 'control-point-distance': 10,
        // 'z-index': 2,
      }
    }]
    this.cytoscape = cytoscape(this.options)

    this.hosts = []
    this.srv6Nodes = []
    this.links = []
    this.otherElements = []
  }

  /**
   * Add NetElement
   */
  addNetElement(element: NetElement):NetElement {
    const r = this.cytoscape.add(Object.assign(element))
    console.debug("NetElement" + "(" + element.getName() + ")" +" was added to Cytoscape.")

    const returnValue = Object.assign(element, r)

    // add element to list
    if(returnValue instanceof Host){
      this.hosts.push(returnValue)
    }else if(returnValue instanceof SRv6Node){
      this.srv6Nodes.push(returnValue)
    }else if(returnValue instanceof Link){
      this.links.push(returnValue)
    }else {
      this.otherElements.push(returnValue)
    }

    return returnValue
  }

  /**
   * add host
   * @param id id
   * @returns 
   */
  addHost(id: string, x?: number, y?: number): Host {
    const host = new Host(id)
    host.position = {
      x: x ?? this.cytoscape.width() / 2 + Math.random()*500,
      y: y ?? this.cytoscape.height() / 2 + Math.random()*200
    }
    return this.addNetElement(host)
  }

  /**
   * add SRv6Node
   * @param id id
   * @returns 
   */
  addSRv6Node(id: string, x?: number, y?: number): SRv6Node {
    const srv6Node = new SRv6Node(id)
    srv6Node.position = {
      x: x ?? this.cytoscape.width() / 2 + Math.random()*500,
      y: y ?? this.cytoscape.height() / 2 + Math.random()*200
    }
    return this.addNetElement(srv6Node)
  }

  /**
   * add edge
   * 
   * @param node1 : node1
   * @param node2 : node2
   */
  addLink(node1: string, node2: string, id?: string): Link {
    id = id ?? this.getDefaultLinkId(node1, node2)
    const link = new Link(id, node1, node2)
    return this.addNetElement(link) as Link
  }

  /**
   * add edge
   * 
   * @param node1 : node1
   * @param node2 : node2
   */
  addPacketArc(node1: string, node2: string, id?: string): PacketArc {
    id = id ?? this.getDefaultPacketArcId(node1, node2)
    const packetArc = new PacketArc(id, node1, node2)
    return this.addNetElement(packetArc) as PacketArc
  }

  /**
   * remove element
   * 
   * @param id : removed element id
   */
  removeNetElement(id: string): NetElement {
    const element = this.getNetElement(id)
    this.cytoscape.remove(this.cytoscape.$id(id))

    if(element instanceof Host){
      const index = this.hosts.indexOf(element)
      return this.hosts.splice(index, 1)[0]
    }else if(element instanceof SRv6Node){
      const index = this.srv6Nodes.indexOf(element)
      return this.srv6Nodes.splice(index, 1)[0]
    }else if(element instanceof Link){
      const index = this.links.indexOf(element)
      return this.links.splice(index, 1)[0]
    }else if(element instanceof NetElement){
      const index = this.otherElements.indexOf(element)
      return this.otherElements.splice(index, 1)[0]
    }

    throw Error("No Such NetElement (" + id + ")")
  }

  /**
   * get NetElement
   * 
   * Notes:
   *  * 返り値のnullは，Elementが存在しているかどうかの判定に使用する
   * 
   * @param id 
   * @returns 
   */
  getNetElement(id: string): NetElement | null{
    this.getAllNetElements().forEach(element => {
      if(element.getId() === id){
        return element
      }
    })
    return null
  }

  isNetElement(id: string): boolean {
    return this.getNetElement(id) !== null
  }

  getHosts(): Host[] {
    return this.hosts
  }

  getSRv6Nodes(): SRv6Node[] {
    return this.srv6Nodes
  }

  getLinks(): Link[] {
    return this.links
  }

  getOtherElements(): NetElement[] {
    return this.otherElements
  }

  /**
   * get all element
   * @returns 
   */
  getAllNetElements(): NetElement[] {
    return this.hosts.concat(this.srv6Nodes).concat(this.links).concat(this.otherElements)
  }

  /**
   * Container
   * 
   * @returns HTMLElement
   */
  getContainer(){
    return this.cytoscape.container()
  }

  /**
   * get Cytoscape
   * @returns Core
   */
  getCytoscape(){
    return this.cytoscape
  }

  /**
   * get default link id
   * @param node1 {string}
   * @param node2 {string}
   * @returns 
   */
  private getDefaultLinkId(node1: string, node2: string): string {
    let id = "l-" + node1 + node2
    if(this.getNetElement(id) !== null) {
      id += Math.random()
    }
    return id
  }

  /**
   * get default packetArc id
   * @param node1 {string}
   * @param node2 {string}
   * @returns 
   */
   private getDefaultPacketArcId(node1: string, node2: string): string {
    let id = "arc-" + node1 + node2
    if(this.getNetElement(id) !== null) {
      id += Math.random()
    }
    return id
  }

  /**
   * Set Event
   * @param events 
   * @param selector 
   * @param handler 
   * @returns 
   */
  on(events: string, selector: string, handler: (event: EventObject) => void): SRv6Network {
    this.cytoscape.on(events, selector, handler)
    return this
  }

  /**
   * Set Tap Event
   * @param handler 
   * @returns 
   */
  onTapNodes(handler: (event: EventObject) => void): SRv6Network {
    this.cytoscape.on("tap", "nodes", handler)
    return this
  }
}
