
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
    let protocol = ""

    // get protocol
    if (firstPacketObj) {
      const pkt_layers: string[] = packets[0].packet_layers ?? Object.keys(firstPacketObj)
      protocol = pkt_layers[pkt_layers.length - 1]

      if (["Raw", "Padding"].includes(protocol)) {
        if (protocol === "Raw") {
          protocol = pkt_layers[pkt_layers.length - 2] + " (Raw)"
        } else {
          protocol = pkt_layers[pkt_layers.length - 2]
        }
      }
      const find_inner = pkt_layers.find((key) => {
        return key.includes("inner")
      })
      if (find_inner) {  // inner Transport Layer Protocol (IP VPN)
        protocol = protocol + " - encap"
      }
    } else {
      protocol = "Unknown"
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
    this.addToContents(flow.flow_id, flowFiled.protocol, flowPaths.length, flowFiled, flowPaths)
    this.classes.push(["trace", styleClass ?? ""])
  }

  private addToContents(flow_id: string, protocol: number, count: number, flowKeys: any, paths: string[][]) {
    this.contents.push(
      [flow_id, protocol.toString(), count.toString(), flowKeys]
    )
    this.flowPaths.push(paths)
  }
}

