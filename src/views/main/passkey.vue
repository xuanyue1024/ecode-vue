<template>
  <div>
    <el-card>
      <el-row>
        <el-col :span="24">
          <el-table :data="passkeyList" :default-sort="{ prop: 'credential.signatureCount', order: 'descending' }"
            style="width: 100%" max-height="90%">
            <el-table-column fixed type="index" label="序号" width="150"></el-table-column>
            <el-table-column prop="credentialNickname" label="名称" width="120"></el-table-column>
            <el-table-column prop="credential.credentialId" label="ID"></el-table-column>
            <el-table-column prop="credential.signatureCount" label="使用次数" width="120"></el-table-column>
            <el-table-column prop="registration" label="注册时间" width="300"></el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
              <template slot-scope="scope">
                <el-button @click="deletePasskey(scope.row.credential.credentialId)" type="text"
                  size="small">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <br>
      <el-row :span="24"><el-button @click="registerPasskey">注册Passkey</el-button></el-row>
    </el-card>


  </div>
</template>

<script>
import { base64ToArrayBuffer } from '@/utils/tool';
import { getPasskeyList, deletePasskey, getPasskeyRegistration, passkeyRegistration } from '@/api/user';
export default {
  name: 'passkey',
  data() {
    return {
      passkeyList: []
    }
  },
  created() {
    this.getPasskeyList();
  },
  methods: {
    //通行密钥列表
    getPasskeyList() {
      getPasskeyList().then(res => {
        if (res.data.code === 200) {
          this.passkeyList = res.data.data;
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    deletePasskey(id) {
      deletePasskey(id).then(res => {
        if (res.data.code === 200) {
          this.$message.success('删除成功')
          this.getPasskeyList();
        } else {
          this.$message.error('删除失败');
        }
      })
    },
    async registerPasskey() {
      try {
        const result = await this.$prompt('请输入密钥名称', '提示', { confirmButtonText: '确定', cancelButtonText: '取消' });
        const res = await getPasskeyRegistration(); // 等待获取注册选项

        if (res.data.code === 200) {
          const publicKeyOptions = res.data.data.publicKey;

          //处理数据
          console.log(publicKeyOptions)
          publicKeyOptions.user.id = base64ToArrayBuffer(publicKeyOptions.user.id);
          publicKeyOptions.challenge = base64ToArrayBuffer(publicKeyOptions.challenge);
      
          //如果已经注册，则取消
          if (publicKeyOptions.excludeCredentials) {
            publicKeyOptions.excludeCredentials = publicKeyOptions.excludeCredentials.map(cred => ({
              ...cred,
              id: base64ToArrayBuffer(cred.id)
            }));
          }
          // publicKeyOptions.excludeCredentials = [];//测试使用

          console.log(publicKeyOptions)
          const credential = await navigator.credentials.create({
            publicKey: publicKeyOptions
          });
          console.log(credential); // 可以在这里处理 credential

          // 发送到服务器进行验证
          const data = {
            credential: `${JSON.stringify(credential)}`,
            name: result.value
          }
          console.log(data);
          passkeyRegistration(data).then(res => {
            if (res.data.code === 200) {
              this.$message.success('注册成功🎉🎉🎉')
              this.getPasskeyList();
            } else {
              this.$message.error('注册失败')
            }
          })
        }
      } catch (error) {
        console.error('注册失败:', error);
        this.$message.error('密钥注册失败');
      }
    }
  }
};
</script>