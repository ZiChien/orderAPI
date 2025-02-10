import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();

async function createTopic() {
    const topicName = 'new-orders';
    await pubsub.createTopic(topicName);
}

async function createSubscription() {
    const topicName = 'new-orders';
    const subscriptionName = 'zcorder-api-subscription';
    const topic = pubsub.topic(topicName);
    await topic.createSubscription(subscriptionName);
}
