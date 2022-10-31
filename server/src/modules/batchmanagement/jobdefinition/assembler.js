const convertJobDefinition = (awsJobDefinition, bodyParams) => {
  const { revision, jobDefinitionArn, jobDefinitionName } = awsJobDefinition;
  const { image, environment, vcpus, memory } = bodyParams;
  return {
    jobDefinitionName,
    revision: {
      jobDefinitionArn,
      revision,
      status: "Active",
      type: "container",
      containerProperties: {
        image,
        vcpus: vcpus || 0,
        memory: memory || 0,
        environment,
      },
    },
  };
};

module.exports = {
  convertJobDefinition,
};
