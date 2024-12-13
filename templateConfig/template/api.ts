import { DelayTime } from '@bo/fun'
import request from '@library/tools/request'

export default {
  list: (data) => {
    // in development mock data
    // if (process.env.NODE_ENV === 'development') {
    //   return DelayTime(500).then((res) => ({
    //     resultList: [
    //       {
    //         accountNumber: 'CUT14AV8',
    //         key: '2',
    //         id: '842802382911123456',
    //         entryDate: '2023-04-07',
    //         accountId: '6PJGS0K8TQUD0CPAARH83DK0J8',
    //         amount: 888,
    //         quantity: 666,
    //         toAccountNumber: 'CUT14AV8',
    //         status: 'PENDING',
    //         requestId: 'A6G436GGOQ5JCLL7EH397T4ODA',
    //         createTime: '2023-04-08T03:02:58.386+0000',
    //         creatorId: 'sys',
    //         updateTime: '2023-04-08T03:03:00.123+0000',
    //         totalNum: 1,
    //         unknownNum: 1,
    //       },
    //     ],
    //     totalRows: 1,
    //   }))
    // }
    return request('/api/pt/bo/cash2Margin/assetTransfer/page', {
      method: 'POST',
      data
    })
  },
  /* feature_detail_start */
  detail: (params: { id: string }) => {
    return request('/api/pt/bo/cash2Margin/assetTransfer/detail', {
      method: 'GET',
      params
    })
  },
  /* feature_detail_end */
  /* feature_edit_start */
  create: (data) => {
    return request('', {
      method: 'POST',
      data
    })
  },
  update: (data = {}) => {
    return request('', {
      method: 'POST',
      data
    })
  },
  /* feature_edit_end */
  /* feature_delete_start */
  delete: (data) => {
    return request('', {
      method: 'POST',
      data
    })
  }
  /* feature_delete_end */
}
