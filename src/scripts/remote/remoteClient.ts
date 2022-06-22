import { io, Socket } from 'socket.io-client';

import * as devices from '@/scripts/net/elements';


/**
 * WebSocket Client
 */
export class WSClient {

  /**
   * server ip address
   */
   private ip: string

   /**
    * server port number
    */
   private port: string

  /**
   * Socket
   */
  private socket: Socket

  /**
   * Web Socket Namespace
   */
  private namespace = ""

  constructor(ip: string, port: string, namespace?: string){
    this.ip = ip
    this.port = port
    this.namespace = namespace ?? ""
    this.socket = io('http://' + this.getIp() + ":" + this.getPort() + "/" + this.namespace)
    this.setupEvent()
  }

  setupEvent(){
    /**
     * all event
     */
    this.socket.prependAny((event: any, ...args: any[]) => {
      console.log(`get ${event}`);
    })

    /**
     * connect event
     */
    this.socket.on("connect", () => {
      console.log("connect!!")
    })
    
    /**
     * disconnect event
     */
    this.socket.on("disconnect", () => {
      console.log("disconnect!!")
    })
    
    /**
     * packet event
     */
     this.socket.on("packet", () => {
      console.log("packet!!")
    })
  }

  /**
   * connect to server
   */
  connect(){
    this.socket.connect()
  }
  
  /**
   * emit to server
   * @param event : event name
   * @param data : sent data
   */
  protected emit(event: string, data: any, callback?: (d: any)=>void){
    console.log("try to emit event=" + event + " data=" + data)
    this.socket.emit(event, data, (data: any) => {
      console.log(event + " response ")
      console.log(data)
      if(callback){
        callback(data)
      }
    })
  }

  /**
   * get nodes
   * @param callback 
   */
   getNodes(callback: (nodes: string[]) => void){
    this.emit("get_nodes", "", (data: string) => {
      const nodeRes = JSON.parse(data)
      callback(nodeRes)
    })
  }

  /**
   * get links
   * @param callback 
   */
  getLinks(callback: (links: string[]) => void){
    this.emit("get_links", "", (data: string) => {
      const linkRes = JSON.parse(data)
      callback(linkRes)
    })
  }

  /**
   * get SRv6 Paths
   * @param callback 
   */
  getSRv6Paths(callback: (paths: string[]) => void){
    this.emit("get_paths", "", (data: string) => {
      const pathRes = JSON.parse(data)
      callback(pathRes)
    })
  }

  
  /**
   * target ip address
   * @returns string
   */
  getIp(){
    return this.ip
  }

  /**
   * target port number
   * @returns string
   */
  getPort(){
    return this.port
  }
  
}
