
interface PacketInfoForView {
  ipv6_src: string,
  ipv6_dst: string,
  segment_list: string[]
}

type ViewHeader = [string, string, ...string[]]
type ViewContent = [string, string, ...any[]]
type ViewContents = ViewContent[]

export interface ViewTable {
  columnNum: number,
  // table header
  header: ViewHeader,
  // table row contents
  contents: ViewContents
  // css class
  classes: string[][]

  getContentPaths(index: number): string[] | string[][]
}


function showPacketInfoForView(pktInfo: PacketInfoForView) {
  return `IPv6(src: ${pktInfo.ipv6_src} dst: ${pktInfo.ipv6_dst}) / SRH(segments: [${pktInfo.segment_list}])`
}



export class ViewPathTable implements ViewTable {
  columnNum: number
  header: ViewHeader
  contents: ViewContents
  paths: string[][]
  classes: string[][]

  constructor() {
    this.columnNum = 3
    this.header = ["Protocol", "Path", "Packet"]
    this.contents = []
    this.paths = []
    this.classes = []
  }

  getContentPaths(index: number): string[] | string[][] {
    return this.paths[index]
  }

  clear() {
    this.contents = []
  }

  addPath(packets: any[], styleClass?: string) {
    const pathNodes: string[] = []
    const firstPacketObj: any = packets[0].packet_obj
    const packetId: number = packets[0].packet_id
    let protocol = Object.keys(firstPacketObj)[0]

    // get protocol
    if (Object.keys(firstPacketObj).length > 3) {  // inner Transport Layer Protocol (IP VPN)
      protocol = Object.keys(firstPacketObj)[3]
    } else if (Object.keys(firstPacketObj).length > 1) {  // outer Transport Layer Protocol
      protocol = Object.keys(firstPacketObj)[1]
    }

    // get path
    packets.forEach(p => {
      pathNodes.push(p.node)
    })

    // get packet info
    const packetInfo: PacketInfoForView = {
      "ipv6_dst": firstPacketObj.IPv6.dst,
      "ipv6_src": firstPacketObj.IPv6.src,
      "segment_list": firstPacketObj["IPv6 Option Header Segment Routing"].addresses
    }

    // add
    this.addToContents(packetId, protocol, pathNodes, packetInfo)
    this.classes.push(["trace", styleClass ?? ""])
  }

  private addToContents(packetId: number, protocol: string, pathNodes: string[], packetInfo: PacketInfoForView) {
    this.contents.push(
      [packetId.toString(), protocol, pathNodes.join(" -> "), showPacketInfoForView(packetInfo)]
    )
    this.paths.push(pathNodes)
  }
}

export class ViewFlowTable implements ViewTable {
  columnNum: number
  header: ViewHeader
  contents: ViewContents
  flowPaths: string[][][]
  classes: string[][]

  constructor() {
    this.columnNum = 3
    this.header = ["Protocol", "Count", "Flow (ipdst, ipsrc, dport, sport, proto)"]
    this.contents = []
    this.flowPaths = []
    this.classes = []
  }

  getContentPaths(index: number): string[] | string[][] {
    return this.flowPaths[index]
  }

  clear() {
    this.contents = []
  }

  addFlow(flow: any, styleClass?: string) {
    const flowFiled: any = flow.flow_keys
    const flowPaths: string[][] = flow.paths

    // add
    this.addToContents(flowFiled.protocol, flowPaths.length, flowFiled, flowPaths)
    this.classes.push(["trace", styleClass ?? ""])
  }

  private addToContents(protocol: number, count: number, flowKeys: any, paths: string[][]) {
    this.contents.push(
      ["", protocol.toString(), count.toString(), flowKeys]
    )
    this.flowPaths.push(paths)
  }
}

