<template>
    <b-container class="bv-example-row mt-3">
    <b-row>
      <b-col>
        <h3 style="color: black;">팁 등록</h3>
      </b-col>
    </b-row>
    <board-input-item type="write" class="mb-5" />
  </b-container>
</template>

<script>
import BoardInputItem from './item/BoardInputItem.vue';

export default {
  name: 'BoardWrite',
  components: {BoardInputItem},
  data() {
    return {
      message: '',
    };
  },
  created() {},
  methods: {},
};
</script>

<style scoped></style>