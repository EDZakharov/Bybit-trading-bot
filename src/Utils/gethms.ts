export const gethms = function (
    date: Date,
    args: number | string | undefined = ''
): string {
    return (
        `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${
            date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        }:${
            date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
        }` + args
    );
};
