const styles = (theme) => ({
    cardTitle: {
        textAlign: 'center',
        fontSize: '16px',
        padding: '10px 0',
        backgroundColor: theme.palette.type === 'dark' ? '#505067' : '#faf6f1',
    },
    cardBody: {
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '20px 0',
    },
    logo: {
        height: '64px',
        width: '64px',
        marginTop: '5px',
    },
    logoTitle: {
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '4px 0 12px 0',
    },
    cardLeftStrong: {
        textAlign: 'left',
        paddingLeft: '10px',
        fontWeight: 'bold',
        '& span': {
            fontWeight: 'normal',
        }
    },
    height: {
        height: '250px'
    }
});

export default styles;