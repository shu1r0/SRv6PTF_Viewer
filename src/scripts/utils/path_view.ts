
interface PacketInfoForView{
  ipv6_src: string,
  ipv6_dst: string,
  srh_list: string[]
}

type ViewHeader =  [string, string, ...string[]]
type ViewContent = [string, string, ...any[]]
type ViewContents = ViewContent[]

export interface ViewTable {
  columnNum: number,
  header: ViewHeader,
  contents: ViewContents
  paths: string[][]
}


export class ViewPathTable implements ViewTable{
  columnNum: number
  header: ViewHeader
  contents: ViewContents
  paths: string[][]
  
  constructor(){
    this.columnNum = 3
    this.header = ["PacketID", "Protocol", "Path"]
    this.contents = []
    this.paths = []
  }

  clear(){
    this.contents = []
  }

  addPath(packets: any[]){
    const pathNodes: string[] = []
    const firstPacketObj: any = packets[0].packet_obj
    const packetId: number = packets[0].packet_id
    let protocol = Object.keys(firstPacketObj)[0]

    // get protocol
    if (Object.keys(firstPacketObj).length > 3){  // inner Transport Layer Protocol (IP VPN)
      protocol = Object.keys(firstPacketObj)[3]
    }else if (Object.keys(firstPacketObj).length > 1){  // outer Transport Layer Protocol
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
      "srh_list": firstPacketObj["IPv6 Option Header Segment Routing"].addresses
    }

    this.addToContents(packetId, protocol, pathNodes, packetInfo)
  }

  private addToContents(packetId: number, protocol: string, pathNodes: string[], packetInfo: PacketInfoForView){
    this.contents.push(
      [packetId.toString(), protocol, pathNodes.join(" -> "), packetInfo]
    )
    this.paths.push(pathNodes)
  }
}

