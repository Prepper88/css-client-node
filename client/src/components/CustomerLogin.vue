<template>
  <div class="login-container">
    <el-card class="login-box">
      <h2>Customer Login</h2>
      <el-form @submit.native.prevent="login">
        <el-form-item label="Customer ID">
          <el-input v-model="customerId" placeholder="Enter your ID" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="password" type="password" placeholder="Enter your password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">Login</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      customerId: '',
      password: '',
    }
  },
  methods: {
    login() {
      if (this.password === '123456') {
        this.$router.push({ path: '/chat', query: { customerId: this.customerId } })
      } else {
        this.$message.error('Invalid password. Please try again.')
      }
    },
  },
}
</script>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 400px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
