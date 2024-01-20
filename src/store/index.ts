import { createStore, useStore } from 'vuex'
import { computed } from 'vue'

export default createStore({
  state: {
    topoView: {
      columnNum: [8],
    },
    flowView: {
      representation: "thickness",
      thickness: 1,
    },
  },
  mutations: {
    updateTopoViewColumnNum(state, columnNum: string) {
      const columnArray = columnNum.split(",").map((v: string) => {
        return parseInt(v, 10)
      }).filter((parsed) => {
        return !isNaN(parsed)
      })
      if (columnArray && columnArray.length > 0) {
        state.topoView.columnNum = columnArray
      }
    },
    updateFlowViewRepresentation(state, representation) {
      state.flowView.representation = representation
    },
    updateFlowViewThickness(state, thickness) {
      state.flowView.thickness = thickness
    },
  },
  actions: {
  },
  modules: {
  }
})



export const useTopoViewColumnNum = () => {
  const store = useStore()
  const topoViewColumnNum = computed({
    get() {
      return store.state.topoView.columnNum
    },
    set(value) {
      store.commit('updateTopoViewColumnNum', value)
    }
  })
  return topoViewColumnNum
}


export const useFlowViewRepresentation = () => {
  const store = useStore()
  const flowViewRepresentation = computed({
    get() {
      return store.state.flowView.flowRepresentation
    },
    set(value) {
      store.commit('updateFlowViewRepresentation', value)
    }
  })
  return flowViewRepresentation
}


export const useFlowViewThickness = () => {
  const store = useStore()
  const flowViewThickness = computed({
    get() {
      return store.state.flowView.flowThickness
    },
    set(value) {
      store.commit('updateFlowViewThickness', value)
    }
  })
  return flowViewThickness
}
