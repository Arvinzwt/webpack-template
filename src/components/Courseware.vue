<template>
  <div class="iframe">
    <slot class="fill" name="loading"></slot>

    <iframe id="lessonFrame" name="lessonFrame" allow="autoplay" class="fill" scrolling="no"></iframe>
    <slot></slot>
  </div>
</template>
<script>
import Record from '@/service/Record'
import touchStudent from "@/assets/image/touch_stu.png";
import touchTeacher from "@/assets/image/touch_tea.png";
import { mapState } from "vuex";

export default {
  name: "Courseware",
  data() {
    return {
      touchStudent,
      touchTeacher,
      courseData: {
        page: 1
      },
    };
  },
  computed: {
    ...mapState("user", {
      user: state => state
    }),
    ...mapState("student", {
      student: state => state
    })
  },
  methods: {
    init() {
      this.course.iframe = "#lessonFrame";
      let icon = this.course.userType == this.Global.UserType.TEACHER ? this.touchTeacher : this.touchStudent;
      this.course.cursor = { icon, offsetX: 16, offsetY: 0 };
      this.course.reload();
    },
    replaceCourseUrl(url, list, index) {
      list = list || [], index = index || 0;
      if (list.length) {
        var reg = new RegExp(/\/\/(.*?)\//);
        return url.replace(reg.exec(url)[1], list[index]);
      } else {
        return null;
      }
    },
    initCourse() {
      const that = this;
      //课件程序请求开示
      this.course.load_bak_index = this.course.load_bak_index || 0;
      this.course.on(that.course.EVENT_OPEN, function (url, page, pages) {
        that.course.load_bak_tid = setTimeout(function () {
          clearTimeout(that.course.load_bak_tid);
          that.course.load_bak_tid = 0;

          const _url = that.replaceCourseUrl(that.course.url, that.course.load_bak_list, that.course.load_bak_index);
          if (_url) { that.course.src = _url; that.course.load_bak_index++ }
          console.log('The courseware address is updated to ', _url);
        }, that.course.load_bak_timeout * 1000);
      });

      //课件程序请求加载成功
      that.course.on(that.course.EVENT_COMPLETE, function (url) {
        clearTimeout(that.course.load_bak_tid);
        that.course.load_bak_tid = 0;
        if (that.user.type == that.Global.UserType.TEACHER) {
          that.course.hasAuthority(true);
        } else if (that.user.type == that.Global.UserType.STUDENT) {
          that.course.hasAuthority(that.student.animate);
        } else {
          that.course.hasAuthority(false);
        }
      });

      //页面更换完成
      this.course.on(this.course.EVENT_PAGE_COMPLETE, function (page, total, single, action) {
        var list = that.course.actionlist || [];
        list.forEach(function (msg) {
          that.course.mockAction(msg);
        });
        that.course.actionlist = [];
      });

      //课件异常
      this.course.on(this.course.EVENT_ERROR, function (type, text) {
        switch (type) {
          case "first":
            text = that.$t("course_page_first");
            break;
          case "last":
            text = that.$t("course_page_last");
            break;
          case "init":
            text = that.$t("course_page_error");
            break;
          case "error":
            text = that.$t("course_error");
            break;
        }
        that.alert.tip(text);
      });
    }
  },
  mounted() {
    this.initCourse();
  }
};
</script>

<style lang="less" scoped>
.iframe {
  border: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  .fill {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  iframe {
    border: none;
    position: absolute;
    width: calc(100% + 2px) !important;
    height: calc(100% + 2px) !important;
    top: -1px !important;
    left: -1px !important;
  }
}
</style>