<template>
  <view class="form-card">
    <!-- 基本提示 -->
    <view class="help-box">
      <text class="help-text">您的举报对保护野生动物至关重要，我们将严格保密。</text>
    </view>

    <!-- 表单字段 -->
    <view class="form-section" v-for="section in sections" :key="section.key">
      <view class="label">{{ section.label }}<text v-if="section.required" class="required">*</text></view>
      <component
        :is="section.component"
        v-bind="section.props"
        @input="formData[section.key] = $event"
      />
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" @click="submitReport">提交举报</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {},
      sections: [
        { key: "location", label: "事发地点", required: true, component: "location-input" },
        { key: "type", label: "事件类型", required: true, component: "type-selector" },
        { key: "time", label: "事件时间", required: true, component: "datetime-picker" },
        { key: "description", label: "详细描述", required: true, component: "textarea-input" },
        { key: "photos", label: "上传照片", component: "image-uploader" }
      ]
    };
  },
  methods: {
    submitReport() {
      // 校验必填字段
      const missing = this.sections.filter(
        (section) => section.required && !this.formData[section.key]
      );
      if (missing.length) {
        return uni.showToast({ title: "填写所有必填项后提交", icon: "none" });
      }

      // 向服务器提交数据
      uni.showLoading({ title: "提交举报中..." });
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: "举报已提交", icon: "success" });
      }, 1000);
    }
  }
};
</script>

<style scoped>
.form-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px;
}
.help-text {
  color: #1b4b8c;
}
.required {
  color: red;
}
.submit-btn {
  background: #1b4b8c;
  color: white;
  border-radius: 12px;
}
</style>