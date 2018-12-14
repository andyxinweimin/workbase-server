import './inbox-layout';
import './inbox';
import './thread';
import './message';
import './thread-detail';
import './thread-list';
import './message-form';
import './style.css';

InboxController = ApplicationController.extend({
  template: 'Inbox',
  perPage: 20,
  subscriptions() {
    this.threadsSub = this.subscribe("threads", {limit: this.limit()});
    let threadId = this.threadId();
    if (threadId) {
      this.subscribe("thread", threadId);
    }
  },
  limit: function() {
    return parseInt(this.params.query.limit) || this.perPage;
  },
  threadId() {
    return this.params._id;
  },
  thread() {
    let threadId = this.threadId();
    return threadId && Threads.findOne(threadId);
  },
  data() {
    let query = _.clone(this.params.query);
    _.extend(query, {limit: this.limit() + this.perPage});
    let nextPath = this.route.path(this.params, {query});
    let hasMore = Counts.get('threads') > this.limit();
    return {
      threads:    Threads.find({}, {sort: {updatedAt: -1}}),
      thread:     this.thread(),
      ready:      this.threadsSub.ready(),
      nextPath:   hasMore ? nextPath : null,
      hasRight:   !!this.threadId(),
      hasSidebar: !!this.params.query.detail
    };
  }
});

Router.route('/inbox/:_id?', {
  name: 'inbox',
  controller: 'InboxController'
});