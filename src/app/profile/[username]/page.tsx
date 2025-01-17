
const page = async ({ params }: { params: { username: string } }) => {

    const username = params.username

    return (
        <div>page</div>
    )
}

export default page