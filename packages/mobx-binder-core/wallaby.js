module.exports = function (wallaby) {
    console.log(wallaby);
    return {
        files: [
            'src/**/*.ts'
        ],
        tests: [
            'src/**/*Spec.ts'
        ],
        env: {
            type: 'node',
            params: {
                runner: '-r ./src/test/setupEnvironment.ts'
            }
        },
        trace: true
    };
};
