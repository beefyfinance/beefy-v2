const styles = (theme) => ({
    wallet: {
        border: 'solid 2px #54995C',
        backgroundColor: '#54995C',
        borderRadius: '30px',
        height: '44px',
        '& .MuiGrid-container': {
            color: '#FFFFFF',
            flexWrap: 'nowrap',
            cursor: 'pointer',
            padding: '8px 19px 0px 19px',
        },
        '& .MuiTypography-root': {
            fontWeight: 'bold',
        },
    },
    connected: {
        border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #ff0000',
        borderRadius: '30px',
        height: '44px',
        '& .MuiAvatar-root': {
            height: '24px',
            width: '24px',
            marginRight: '8px',
        },
        '& .MuiGrid-container': {
            color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
            flexWrap: 'nowrap',
            cursor: 'pointer',
            padding: '8px 19px 0px 19px',
        },
        '& .MuiTypography-root': {
            fontWeight: 'bold',
        },
        '&:hover': {
            borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#6B7199',
        },
        '&:hover .MuiGrid-container': {
            color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
        },
    },
    loading: {
        paddingTop: '4px',
    }
});

export default styles;
